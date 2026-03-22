import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import type { NextConfig } from "next";

/** peaks/.env only (parent of peak/) */
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
  images: {
    // Must list every `quality` value used by next/image (Next.js 16+)
    qualities: [58, 60, 62, 75],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "cdn.cloudflare.steamstatic.com", pathname: "/**" },
      { protocol: "https", hostname: "media.rawg.io", pathname: "/**" },
      { protocol: "https", hostname: "cmsassets.rgpub.io", pathname: "/**" },
      { protocol: "https", hostname: "drop-assets.ea.com", pathname: "/**" },
      { protocol: "https", hostname: "cdna.artstation.com", pathname: "/**" },
      { protocol: "https", hostname: "upload.wikimedia.org", pathname: "/**" },
    ],
  },
};

export default nextConfig;
