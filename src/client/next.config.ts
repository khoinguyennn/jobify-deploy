import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone build for Docker
  output: 'standalone',
  
  // Rewrites for API and uploads
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    
    return [
      {
        source: '/api/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
  
  // Image configuration for different environments
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http', 
        hostname: 'server', // Docker service name
        port: '5000',
        pathname: '/uploads/**',
      },
    ],
  },
  
  // Disable dev indicators in production
  devIndicators: false,
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;