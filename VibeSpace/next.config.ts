/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // React এর extra checks (dev + prod safety)

  poweredByHeader: false, // X-Powered-By: Next.js remove (info leak বন্ধ)

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // প্রয়োজন অনুযায়ী limit
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'], // modern image format (performance + security)
  },

  // async headers() {
  //   return [
  //     {
  //       source: '/(.*)',
  //       headers: [
  //         {
  //           key: 'X-Frame-Options',
  //           value: 'DENY', // clickjacking prevent
  //         },
  //         {
  //           key: 'X-Content-Type-Options',
  //           value: 'nosniff', // MIME sniffing বন্ধ
  //         },
  //         {
  //           key: 'Referrer-Policy',
  //           value: 'strict-origin-when-cross-origin',
  //         },
  //         {
  //           key: 'Permissions-Policy',
  //           value:
  //             'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  //         },
  //         {
  //           key: 'Strict-Transport-Security',
  //           value: 'max-age=63072000; includeSubDomains; preload',
  //         },

  //       ],
  //     },
  //   ];
  // },
};

module.exports = nextConfig;


// {
//   key: 'Content-Security-Policy',
//   value: `
//     default-src 'self';
//     script-src 'self';
//     style-src 'self' 'unsafe-inline';
//     img-src 'self' https://res.cloudinary.com https://lh3.googleusercontent.com https://avatars.githubusercontent.com data:;
//     font-src 'self';
//     connect-src 'self';
//     frame-ancestors 'none';
//   `.replace(/\s{2,}/g, ' ').trim(),
// },