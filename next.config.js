/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Permite build aunque haya errores de TypeScript
    ignoreBuildErrors: true,
  },
  eslint: {
    // Permite build aunque haya errores de ESLint
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
