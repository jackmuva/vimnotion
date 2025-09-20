import type { Metadata } from "next";
import { Geist, Geist_Mono, Libre_Baskerville } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const custom = Libre_Baskerville({
	weight: "400",
	variable: "--font-custom",
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
					${custom.variable} antialiased`}>
				{children}
			</body>
		</html>
	);
}
