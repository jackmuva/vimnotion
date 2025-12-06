import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	devIndicators: false,
	async rewrites() {
		return {
			beforeFiles: [
				{
					source: "/api/:path*",
					destination: `${process.env.BACKEND_BASE_URL}/api/:path*`,
				},
				{
					source: "/oauth/:path*",
					destination: `${process.env.BACKEND_BASE_URL}/oauth/:path*`,
				},
				{
					source: "/image/:path*",
					destination: `${process.env.BACKEND_BASE_URL}/image/:path*`,
				},
			],
		};
	},
};

export default nextConfig;
