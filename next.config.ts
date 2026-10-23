import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Beri tahu Next.js agar tidak mem-bundle ini, ambil langsung dari node_modules
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  
  // Paksa Vercel menyalin folder bin Chromium ke dalam serverless function
  outputFileTracingIncludes: {
    "/api/generate-pdf": ["./node_modules/@sparticuz/chromium/bin/**"],
    "/api/generate-pdf-kelas": ["./node_modules/@sparticuz/chromium/bin/**"],
  },
};

export default nextConfig;