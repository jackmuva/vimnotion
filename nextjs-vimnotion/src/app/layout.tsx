import type { Metadata } from "next";
import { Geist, Geist_Mono, Libre_Baskerville, Pixelify_Sans, Roboto, Roboto_Mono, Roboto_Slab } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const libre = Roboto_Slab({
	weight: "400",
	variable: "--font-libre",
	subsets: ["latin"],
});

const pixel = Roboto_Mono({
	weight: "400",
	variable: "--font-pixel",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "vimnotion",
	description: "notion with vim motion",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable} 
					${libre.variable} ${pixel.variable} antialiased `}>
				{children}
			</body>
		</html>
	);
}
