/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      process: false,
      path: false,
      perf_hooks: false,
      buffer: false,
      worker_threads: false,
    };
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          }
        ]
      }
    ]
  },
  async redirects() {
    return [
      {
        source: '/_next/static/chunks/ammo.wasm.wasm',
        destination: '/public/vhacd/ammo.wasm.wasm',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
// /_next/static/chunks/ammo.wasm.wasm