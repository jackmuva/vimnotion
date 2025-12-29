"use server";

import { MarketingHeader } from "./marketing-header";
import Image from "next/image";
import { StartButtonOverlay } from "./start-button-overlay";

export default async function MarketingHome() {
	return (
		<div className="bg-background h-dvh w-dvw flex flex-col justify-start items-center font-robo-slab text-lg
			pb-20 overflow-y-auto gap-32 no-scrollbar">
			<MarketingHeader />
			<div className="w-full flex flex-col gap-8 items-center">
				<h1 className="text-5xl text-center">
					Write at the speed of your thoughts
				</h1>
				<h2 className="text-3xl text-center">
					A writing app for users who want to love their tools
				</h2>
				<img src="/speed-of-thoughts.gif" alt="gif demo of vimnotion" className="rounded-sm outline 
				outline-offset-2 outline-foreground/20" width={1100} height={500} />
			</div>
			<div className="w-full flex flex-col gap-5 items-center">
				<h2 className="text-4xl text-center">
					Writing and note taking should feel frictionless
				</h2>
				<h3 className="text-center text-2xl">
					<strong>Stop</strong> constantly clicking on bloated menus. <strong>Stop</strong> interrupting your flow.
				</h3>
				<img src="/comps.png" alt="menus" className="w-11/12 max-w-[800px] rounded-sm border 
				border-foreground/20 grayscale-25 brightness-90" />
				<h3 className="text-center text-2xl">
					Just simple functions and keybindings that feel <span className="text-yellow-600 dark:text-yellow-500 font-bold">buttery smooth</span>
				</h3>
				<img src="/simple-functions.png" alt="simple functions" className="w-11/12 max-w-[800px] rounded-sm border 
				border-foreground/20" />
			</div>
			<div className="w-full flex flex-col items-center gap-4">
				<h2 className="text-3xl text-center">
					Rooted in <strong className="underline">Markdown</strong> and <strong className="underline">Vim</strong>&nbsp;
				</h2>
				<div className="flex flex-col md:flex-row w-11/12 max-w-[1200px] items-center md:items-start justify-center gap-4 md:gap-10">
					<h3 className="flex-1 text-xl text-center">
						Craft beautiful documents with the simplicity of&nbsp;<span className="font-bold underline">Markdown</span>
					</h3>
					<h3 className="flex-1 text-xl text-center">
						<span className="underline font-bold">Vim motions</span>, split panes, tabs all at your fingertips
					</h3>
				</div>
				<div className="flex flex-col md:flex-row w-11/12 max-w-[1200px] items-center md:items-start justify-center gap-4 md:gap-10">
					<img src="/markdown-s.png"
						height={50}
						width={600}
						className="flex-1 rounded-sm border border-foreground/20"
						alt="markdown" />
					<img src="/split-ss.png"
						height={50}
						width={600}
						className="flex-1 rounded-sm border border-foreground/20"
						alt="split screen" />
				</div>
			</div>
			<div className="flex flex-col gap-4">
				<h3 className="text-3xl text-center justify-center">
					Try VimNotion
				</h3>
				<div className="h-14 flex justify-center">
					<StartButtonOverlay variant="normal" />
				</div>
			</div>
		</div >
	);
}
