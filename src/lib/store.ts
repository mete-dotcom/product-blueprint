/**
 * Vercel KV store — shared by DeepStrain, ATLAS and ADAUTO.
 *
 * Key namespaces:
 *   DeepStrain : user:{email}   license:{key}    session:{token}
 *   Atlas      : atlas:lic:{email}   atlas:act:{sessionId}
 *   Adauto     : adauto:lic:{email}  adauto:act:{sessionId}
 */

import { Redis } from "@upstash/redis";

const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ─── DeepStrain types ────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  tier: string;
  created: string;
  verified?: boolean;
}

export interface License {
  key: string;
  userId: string;
  email: string;
  tier: string;
  issued: string;
  expires: string;
  valid: boolean;
  hardware_id?: string;
}

export interface Session {
  token: string;
  userId: string;
  email: string;
  created: string;
  expires: string;
}

// ─── Atlas types ─────────────────────────────────────────────────────────────

export interface AtlasLicense {
  version: string;
  email: string;
  tier: string;
  modules: string[];
  sale_id: string;
  subscription_id: string;
  issued_at: string;
  expires_at: string;
  signature: string;
}

// ─── DeepStrain KV helpers ───────────────────────────────────────────────────

export async function getUser(email: string): Promise<User | null> {
  return kv.get<User>(`user:${email.toLowerCase()}`);
}

export async function setUser(email: string, user: User): Promise<void> {
  await kv.set(`user:${email.toLowerCase()}`, user);
}

export async function getLicense(key: string): Promise<License | null> {
  return kv.get<License>(`license:${key}`);
}

export async function setLicense(key: string, license: License): Promise<void> {
  await kv.set(`license:${key}`, license);
}

export async function deleteLicense(key: string): Promise<void> {
  await kv.del(`license:${key}`);
}

export async function getAllUsers(): Promise<User[]> {
  const keys = await kv.keys("user:*");
  if (!keys.length) return [];
  const results = await kv.mget<User[]>(...keys);
  return results.filter((u): u is User => u !== null);
}

export async function getAllLicenses(): Promise<License[]> {
  const keys = await kv.keys("license:*");
  if (!keys.length) return [];
  const results = await kv.mget<License[]>(...keys);
  return results.filter((l): l is License => l !== null);
}

export async function getSession(token: string): Promise<Session | null> {
  return kv.get<Session>(`session:${token}`);
}

export async function setSession(token: string, session: Session): Promise<void> {
  const ttl = Math.floor((new Date(session.expires).getTime() - Date.now()) / 1000);
  if (ttl > 0) {
    await kv.set(`session:${token}`, session, { ex: ttl });
  } else {
    await kv.set(`session:${token}`, session);
  }
}

// ─── DeepStrain License v2 (HMAC-signed, parallel to Atlas) ─────────────────

export interface DeepstrainLicense {
  version:         string;
  email:           string;
  tier:            "solo" | "team" | "enterprise";
  issued_at:       string;
  expires_at:      string;
  sale_id:         string;
  subscription_id: string;
  signature:       string;
}

export async function getDeepstrainLicense(email: string): Promise<DeepstrainLicense | null> {
  return kv.get<DeepstrainLicense>(`deepstrain:lic:${email.toLowerCase()}`);
}

export async function setDeepstrainLicense(email: string, lic: DeepstrainLicense): Promise<void> {
  await kv.set(`deepstrain:lic:${email.toLowerCase()}`, lic);
}

export async function getDeepstrainActivation(sessionId: string): Promise<DeepstrainLicense | null> {
  return kv.get<DeepstrainLicense>(`deepstrain:act:${sessionId}`);
}

export async function setDeepstrainActivation(
  sessionId: string,
  lic: DeepstrainLicense,
  ttlSec = 7200,
): Promise<void> {
  await kv.set(`deepstrain:act:${sessionId}`, lic, { ex: ttlSec });
}

export async function deleteDeepstrainActivation(sessionId: string): Promise<void> {
  await kv.del(`deepstrain:act:${sessionId}`);
}

// ─── Atlas KV helpers ────────────────────────────────────────────────────────

export async function getAtlasLicense(email: string): Promise<AtlasLicense | null> {
  return kv.get<AtlasLicense>(`atlas:lic:${email.toLowerCase()}`);
}

export async function setAtlasLicense(email: string, lic: AtlasLicense): Promise<void> {
  await kv.set(`atlas:lic:${email.toLowerCase()}`, lic);
}

export async function getAtlasActivation(sessionId: string): Promise<AtlasLicense | null> {
  return kv.get<AtlasLicense>(`atlas:act:${sessionId}`);
}

export async function setAtlasActivation(
  sessionId: string,
  lic: AtlasLicense,
  ttlSec = 7200
): Promise<void> {
  await kv.set(`atlas:act:${sessionId}`, lic, { ex: ttlSec });
}

export async function deleteAtlasActivation(sessionId: string): Promise<void> {
  await kv.del(`atlas:act:${sessionId}`);
}

// ─── Adauto types ─────────────────────────────────────────────────────────────

export interface AdautoLicense {
  version:         string;
  email:           string;
  tier:            "free" | "pro";
  key:             string;       // ADTO-XXXXX-XXXXX-XXXXX-XXXXX
  issued_at:       string;
  expires_at:      string;
  sale_id:         string;
  subscription_id: string;
  signature:       string;
}

// ─── Adauto KV helpers ────────────────────────────────────────────────────────

export async function getAdautoLicense(email: string): Promise<AdautoLicense | null> {
  return kv.get<AdautoLicense>(`adauto:lic:${email.toLowerCase()}`);
}

export async function setAdautoLicense(email: string, lic: AdautoLicense): Promise<void> {
  await kv.set(`adauto:lic:${email.toLowerCase()}`, lic);
}

export async function getAdautoActivation(sessionId: string): Promise<AdautoLicense | null> {
  return kv.get<AdautoLicense>(`adauto:act:${sessionId}`);
}

export async function setAdautoActivation(
  sessionId: string,
  lic: AdautoLicense,
  ttlSec = 7200,
): Promise<void> {
  await kv.set(`adauto:act:${sessionId}`, lic, { ex: ttlSec });
}

export async function deleteAdautoActivation(sessionId: string): Promise<void> {
  await kv.del(`adauto:act:${sessionId}`);
}
