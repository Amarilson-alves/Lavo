/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@lavo/shared', '@lavo/database'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
}

module.exports = nextConfig
