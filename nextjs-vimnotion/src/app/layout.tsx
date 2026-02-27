import type { Metadata } from "next";
import { IBM_Plex_Mono, Geist, Geist_Mono, Roboto_Mono, Roboto_Slab } from "next/font/google";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
	variable: "--font-ibm-plex-mono",
	subsets: ["latin"],
	weight: "400",
})
const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const robo_slab = Roboto_Slab({
	variable: "--font-robo-slab",
	subsets: ["latin"],
});

const robo_mono = Roboto_Mono({
	variable: "--font-robo-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "vimnotion",
	description: "notion with vim motion",
	metadataBase: new URL('https://www.vimnotion.com'),
	alternates: {
		canonical: 'https://www.vimnotion.com',
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="no-scrollbar">
			<body className={`${robo_slab.variable} ${robo_mono.variable} ${geistSans.variable} ${geistMono.variable} ${ibmPlexMono.variable} antialiased no-scrollbar`}>
				{children}
			</body>
		</html>
	);
}
