import type { NextConfig } from "next";
import { fileURLToPath } from "url";

const turbopackRoot = fileURLToPath(new URL(".", import.meta.url));

const nextConfig: NextConfig = {
  // Video: novi video → NEXT_PUBLIC_VIDEO_VERSION u Vercel pa Redeploy. Cloudinary: video ide sa Cloudinary samo ako client vidi cloud name (next.config prosleđuje CLOUDINARY_* u NEXT_PUBLIC_*).
  env: {
    NEXT_PUBLIC_VIDEO_VERSION:
      process.env.NEXT_PUBLIC_VIDEO_VERSION ??
      process.env.VERCEL_GIT_COMMIT_SHA ??
      process.env.VERCEL_BUILD_ID ??
      "",
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??
      process.env.CLOUDINARY_CLOUD_NAME ??
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
