/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // publicRuntimeConfig exposes values to client components
  publicRuntimeConfig: {
    paddleVendorId: process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID,
    paddleEnv: process.env.NEXT_PUBLIC_PADDLE_ENV,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  },
};

module.exports = nextConfig;
