import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zckqgdgpbythgshmdzwz.supabase.co",
        pathname: "/storage/v1/object/public/**", // ✅ safest (only allow public bucket images)
      },
    ],
  },

  // Fix: forces Next.js to process the 3D libraries correctly
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei", "meshline"],
};

export default nextConfig;
