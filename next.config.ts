import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'demos.creative-tim.com',
      },
      {
        protocol: 'https',
        hostname: 'www.material-tailwind.com',
      },
    ],
  },
}

export default nextConfig
