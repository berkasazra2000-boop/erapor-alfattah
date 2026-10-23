// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Pastikan paket ini tidak di-bundle, melainkan diambil langsung dari node_modules
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],

  // 2. Paksa Vercel untuk menyertakan folder binary Chromium ke dalam API route
  outputFileTracingIncludes: {
    "/api/generate-pdf": ["node_modules/@sparticuz/chromium/bin/"],
    "/api/generate-pdf-kelas": ["node_modules/@sparticuz/chromium/bin/"],
  },
};

export default nextConfig;