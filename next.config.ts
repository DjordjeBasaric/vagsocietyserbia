import type { NextConfig } from "next";
import { fileURLToPath } from "url";

const turbopackRoot = fileURLToPath(new URL(".", import.meta.url));

const nextConfig: NextConfig = {
  // Na Vercelu: svaki deploy dobija drugi video URL (commit SHA), pa se ne kešira stari video
  env: {
    NEXT_PUBLIC_VIDEO_VERSION:
      process.env.NEXT_PUBLIC_VIDEO_VERSION ??
      process.env.VERCEL_GIT_COMMIT_SHA ??
      "",
  },
  // Prevent Next/Turbopack from picking an unrelated workspace root
  // when there are multiple lockfiles on the machine.
  turbopack: {
    root: turbopackRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb", // Increased from default 1MB to allow image uploads
    },
  },
};

export default nextConfig;
