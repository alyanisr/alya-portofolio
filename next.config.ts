import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Evidence uploads are validated to 20 MB in the server action.
      bodySizeLimit: "21mb",
    },
  },
};

export default nextConfig;
