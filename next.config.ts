import type { NextConfig } from "next";
import { fileURLToPath } from "url";

const turbopackRoot = fileURLToPath(new URL(".", import.meta.url));

const nextConfig: NextConfig = {
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
};

export default nextConfig;
