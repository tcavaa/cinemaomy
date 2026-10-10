import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Local dev runs on http://cinemaomy.localhost:3000 — Flitt's embedded
  // checkout refuses pages served from a bare "localhost" host.
  allowedDevOrigins: ["cinemaomy.localhost", "*.localhost"],
  images: {
    remotePatterns: supabaseUrl ? [new URL(`${supabaseUrl}/storage/v1/object/public/**`)] : [],
    qualities: [70, 80, 90],
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

export default nextConfig;
