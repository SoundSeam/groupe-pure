import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "framerusercontent.com",
      },
      {
        protocol: "https",
        hostname: "inscriptions.galonsapchq.com",
      },
      {
        protocol: "https",
        hostname: "www.matierepremierearchitecture.ca",
        pathname: "/assets/**",
      },
      {
        protocol: "https",
        hostname: "soundseam-origin.s3.us-east-2.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
