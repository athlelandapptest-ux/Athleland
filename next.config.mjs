/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // prevent eslint errors from blocking builds
  },
  typescript: {
    ignoreBuildErrors: true, // ignore TS type errors during build
  },
  images: {
    // allow optimized remote loading from Supabase Storage
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'esszrvqqputivplofqig.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    // optional: still serve local /public/ images without optimization
    unoptimized: false,
  },
  // Optional: increase static file size limit for larger images
  staticPageGenerationTimeout: 180,
}

export default nextConfig
