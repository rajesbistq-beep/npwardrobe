import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      ...(process.env.NEXT_PUBLIC_SUPABASE_URL ? [supabaseImagePattern(process.env.NEXT_PUBLIC_SUPABASE_URL)] : []),
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

function supabaseImagePattern(rawUrl: string) {
  const url = new URL(rawUrl);
  return {
    protocol: url.protocol.replace(":", "") as "http" | "https",
    hostname: url.hostname,
    port: url.port,
    pathname: "/storage/v1/object/public/**",
  };
}

export default nextConfig;
