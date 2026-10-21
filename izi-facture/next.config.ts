import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      // Tailwind uniquement pour les CSS globaux (globals.css…).
      // Les CSS Modules (*.module.css, ex. la landing page) sont laissés à Next.js :
      // sinon ils sont traités comme du CSS global et leurs classes valent "undefined".
      "*.css": {
        condition: { not: { path: /\.module\.css$/ } },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
