import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to this project so Next doesn't pick up
  // unrelated lockfiles from parent dirs (~/ or ~/personal/).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
