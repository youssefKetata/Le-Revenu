import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the initial rendering model simple; introduce caching when data needs it.
  turbopack: {
    root: __dirname,
    rules: {
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
