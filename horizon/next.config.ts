import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["zckqgdgpbythgshmdzwz.supabase.co"],
  },
  // This is the fix: forces Next.js to process the 3D libraries correctly
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', 'meshline'],
};

export default nextConfig;