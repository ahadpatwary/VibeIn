/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // increase limit
    },
  },
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '', // usually empty
        pathname: '/**', // সব path allow
      },
    ],
  },
};

module.exports = nextConfig;
