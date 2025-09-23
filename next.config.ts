import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   /* config options here */
   images: {
      remotePatterns: [
         {
            protocol: "https",
            hostname: "www.bilibili.com",
         },
         {
            protocol: "https",
            hostname: "www.baidu.com",
         },
         {
            protocol: "https",
            hostname: "i2.hdslb.com",
         },
      ],
   },
};

export default nextConfig;
