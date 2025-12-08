"use server";

import Link from "next/link";
import { MarketingHeader } from "./marketing-header";
import Image from "next/image";

export default async function MarketingHome() {
	return (
		<div className="bg-background w-dvw h-dvh flex flex-col justify-start items-center pt-30 px-4 font-libre text-lg
			pb-20 overflow-y-auto gap-10">
			<MarketingHeader />
			<div className="w-full flex flex-col items-center gap-4">
				<h1 className="font-pixel font-bold text-7xl italic">
					VimNotion
				</h1>
				<h2 className="text-3xl italic">
					The most <strong className="dark:text-yellow-400 text-yellow-600">buttery smooth</strong>
					&nbsp;text editor for notes and documents on the web
				</h2>
				<div className="flex flex-col md:flex-row gap-4 w-11/12 max-w-[1200px]
				items-center md:items-start justify-center py-4">
					<img src="https://vimnotion.com"
						className="md:basis-1/4"
						alt="markdown video" width={900} height={50} />
					<img src="https://vimnotion.com"
						className="md:basis-1/4"
						alt="split screen picture" width={400} height={50} />
					<img src="https://vimnotion.com"
						className="md:basis-1/4"
						alt="navigation video" width={50} height={50} />
				</div>
			</div>
			<div className="w-full flex flex-col items-center gap-4">
				<h2 className="text-3xl italic pt-10">
					Rooted in <strong className="underline">Markdown</strong>&nbsp;
					and <strong className="underline">Vim</strong>&nbsp;
				</h2>
				<div className="flex flex-col md:flex-row gap-4 w-11/12 max-w-[1200px]
				items-center md:items-start justify-center py-4">
					<div className="md:basis-1/2 p-4 flex flex-col 
					justify-center items-center rounded-xs gap-4">
						<h3 className="italic text-2xl text-center font-bold underline">
							Simple, beautiful documents in Markdown
						</h3>
						<Image src="/markdown-s.png"
							className="rounded-sm"
							alt="markdown" width={900} height={500} />
					</div>
					<div className="md:basis-1/2 p-4 flex flex-col 
					justify-center items-center rounded-xs gap-4">
						<h3 className="italic text-2xl text-center font-bold underline">
							With the flow state of Vim editing
						</h3>
						<Image src="/split-ss.png"
							className="rounded-sm"
							alt="split screen" width={900} height={500} />
					</div>
				</div>
			</div>
			<Link target="_self" href={`https://github.com/login/oauth/authorize?scope=read:user,user:email&
						client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}`}
				className='font-bold font-pixel text-3xl px-4 h-12
					border-yellow-600 text-[#151515] border-b-8 border-2 bg-[#ffd497]
					hover:border-b-4 hover:translate-y-1 flex items-center'>
				<div>
					Enter VN
				</div>
			</Link>
		</div>
	);
}
