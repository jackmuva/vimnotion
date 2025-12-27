"use server";

import { MarketingHeader } from "./marketing-header";
import Image from "next/image";
import { StartButtonOverlay } from "./start-button-overlay";

export default async function MarketingHome() {
	return (
		<div className="bg-background w-dvw h-dvh flex flex-col justify-start items-center font-robo-slab text-lg
			pb-20 overflow-y-auto gap-10">
			<MarketingHeader />
			<div className="w-full flex flex-col items-center gap-4">
				<h1 className="font-robo-mono font-bold text-7xl">
					VimNotion
				</h1>
				<h2 className="text-3xl  text-center">
					The most <strong className="dark:text-yellow-400 text-yellow-600">buttery smooth</strong>
					&nbsp;app for <span className="underline">notes and writing</span> on the web
				</h2>
			</div>
			<h2>

			</h2>
			<div className="w-full flex flex-col items-center gap-4">
				<h2 className="text-3xl  pt-10 text-center">
					Rooted in <strong className="underline">Markdown</strong> and <strong className="underline">Vim</strong>&nbsp;
				</h2>
				<div className="flex flex-col md:flex-row gap-4 w-11/12 max-w-[1200px]
				items-center md:items-start justify-center py-4">
					<div className="md:basis-1/2 p-4 flex flex-col 
					justify-center items-center rounded-xs gap-4">
						<h3 className=" text-xl text-center font-bold">
							Craft beautiful documents with the simplicity of&nbsp;<span className="underline">Markdown</span>
						</h3>
						<Image src="/markdown-s.png"
							className="rounded-sm"
							alt="markdown" width={550} height={50} />
					</div>
					<div className="md:basis-1/2 p-4 flex flex-col 
					justify-center items-center rounded-xs gap-4">
						<h3 className=" text-xl text-center font-bold">
							Paying homage to&nbsp;<span className="underline">Vim</span>&nbsp;editors of the past with search, split views, and new tabs at your fingertips
						</h3>
						<Image src="/split-ss.png"
							className="rounded-sm"
							alt="split screen" width={800} height={50} />
					</div>
				</div>
			</div>
			<div className="h-14">
				<StartButtonOverlay variant="normal" />
			</div>
		</div>
	);
}
