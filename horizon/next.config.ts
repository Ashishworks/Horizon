import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["zckqgdgpbythgshmdzwz.supabase.co"], // <-- add your Supabase storage host here
  },
};

export default nextConfig;
