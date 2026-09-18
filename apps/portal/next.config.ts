import type { NextConfig } from "next";
import path from "node:path";
const config: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["prismjuns", "192.168.123.66"],
  turbopack: { root: path.resolve(import.meta.dirname, "../..") },
  experimental: { serverActions: { bodySizeLimit: "128kb" } },
};
export default config;
