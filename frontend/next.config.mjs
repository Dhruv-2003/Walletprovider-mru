/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ethglobal.b-cdn.net",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
