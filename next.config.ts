import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    authInterrupts: true,
    // by default, router cache only cache layouts and loadings, but not pages,
    // with this it will also cache pages
    staleTimes: {
      dynamic: 60,
      static: 300,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: `${process.env.UPLOADTHING_APP_ID}.ufs.sh`,
        pathname: "/f/*",
      },
      {
        protocol: "https",
        hostname: `utfs.io`,
      },
    ],
  },
};

export default nextConfig;
