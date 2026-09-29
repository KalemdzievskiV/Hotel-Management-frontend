import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A self-contained server in .next/standalone, which the Dockerfile runs
  output: "standalone",
  // Pin the workspace root to this folder. Without it, a lockfile in a parent
  // directory makes Turbopack treat the whole parent as the project and
  // watch/scan the backend and mobile app too, which eats all the RAM.
  turbopack: { root: __dirname },
};

export default nextConfig;
