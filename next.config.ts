import type { NextConfig } from "next";
import { createCivicAuthPlugin } from "@civic/auth/nextjs"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
      },
    ],
  },
};

const withCivicAuth = createCivicAuthPlugin({
  clientId: "a1488546-9b15-4fb1-a196-d6f24dc3715f"
});

export default withCivicAuth(nextConfig)


