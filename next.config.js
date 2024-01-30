/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Menonaktifkan caching data secara global
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
