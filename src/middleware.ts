/**
 * Vercel Edge Middleware — DDoS & rate limiting protection
 *
 * Runs on every request AT THE EDGE (before any serverless function).
 * Uses an in-memory sliding-window counter per IP.
 *
 * Limits enforced:
 *   /api/:path       — 60 req / 60s per IP  (general API)
 *   /api/:p/webhook  — 30 req / 60s per IP  (payment webhooks)
 *   /api/:p/activate — 10 req / 60s per IP  (activation — brute-force target)
 *   /api/:p/recovery — 5  req / 60s per IP  (recovery keys — hardest target)
 *
 * Additional protections:
 *   - Blocks requests with no User-Agent (bot traffic)
 *   - Blocks known bad User-Agent patterns
 *   - Sets security headers on every response
 *   - Returns 429 with Retry-After header when rate-limited
 *
 * NOTE: Edge runtime uses globalThis for in-memory state.
 * State resets on each cold start (fine for rate limiting — conservative).
 */

import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/api/:path*'],
};

// ── Rate limit windows ────────────────────────────────────────────────────────

interface Window {
  count: number;
  resetAt: number;
}

// globalThis persists across requests in the same edge worker instance
const _windows: Map<string, Window> = (globalThis as any).__rl_windows ??
  ((globalThis as any).__rl_windows = new Map<string, Window>());

function getLimit(pathname: string): { max: number; windowMs: number } {
  if (/\/(recovery|manual.activ)/i.test(pathname)) return { max: 5,  windowMs: 60_000 };
  if (/\/(activate|activation)/i.test(pathname))   return { max: 10, windowMs: 60_000 };
  if (/\/webhook/i.test(pathname))                  return { max: 30, windowMs: 60_000 };
  return                                                   { max: 60, windowMs: 60_000 };
}

function checkRateLimit(ip: string, pathname: string): { allowed: boolean; retryAfter: number } {
  const { max, windowMs } = getLimit(pathname);
  const key = `${ip}:${pathname.split('/').slice(0, 4).join('/')}`;
  const now = Date.now();

  let w = _windows.get(key);
  if (!w || now > w.resetAt) {
    w = { count: 0, resetAt: now + windowMs };
    _windows.set(key, w);
  }

  w.count++;

  if (w.count > max) {
    const retryAfter = Math.ceil((w.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }
  return { allowed: true, retryAfter: 0 };
}

// ── Bad User-Agent patterns ───────────────────────────────────────────────────

const BAD_UA_PATTERNS = [
  /^python-requests\//i,           // raw Python requests without identifying header
  /masscan/i,
  /nmap/i,
  /sqlmap/i,
  /nikto/i,
  /zgrab/i,
  /go-http-client\/\d/i,           // unidentified Go scanners
  /libwww-perl/i,
  /\bscan\b/i,
];

function isBadUserAgent(ua: string | null): boolean {
  if (!ua || ua.trim() === '') return true;  // no UA = bot
  return BAD_UA_PATTERNS.some(p => p.test(ua));
}

// ── Security headers ──────────────────────────────────────────────────────────

function addSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Prevent caching of API responses
  res.headers.set('Cache-Control', 'no-store');
  return res;
}

// ── IP extraction (Vercel provides x-forwarded-for) ──────────────────────────

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '0.0.0.0'
  );
}

// ── Middleware ────────────────────────────────────────────────────────────────

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const ip = getIP(req);
  const ua = req.headers.get('user-agent');

  // Block bad user agents (except webhooks from Paddle — they use custom UAs)
  if (!pathname.includes('/webhook') && isBadUserAgent(ua)) {
    return addSecurityHeaders(
      new NextResponse(JSON.stringify({ error: 'forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  }

  // Rate limiting
  const { allowed, retryAfter } = checkRateLimit(ip, pathname);
  if (!allowed) {
    return addSecurityHeaders(
      new NextResponse(
        JSON.stringify({
          error: 'rate_limit_exceeded',
          message: `Too many requests. Retry after ${retryAfter}s.`,
          retry_after: retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(getLimit(pathname).max),
            'X-RateLimit-Remaining': '0',
          },
        }
      )
    );
  }

  // Pass through — add security headers
  const res = NextResponse.next();
  addSecurityHeaders(res);
  return res;
}
