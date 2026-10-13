import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Las imagenes de productos se cargan desde el panel por URL o subida a Cloudinary.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
