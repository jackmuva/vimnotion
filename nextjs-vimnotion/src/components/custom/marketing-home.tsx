"use server";

import { MarketingHeader } from "./marketing-header";

export default async function MarketingHome() {
	return (
		<div className="bg-background w-dvw h-dvh flex flex-col justify-start items-center pt-30 px-4 font-libre text-lg">
			<MarketingHeader />
			<h1 className="font-pixel font-bold text-7xl italic">
				VimNotion
			</h1>
			<h2 className="text-3xl italic">
				The most <strong className="dark:text-yellow-400 text-yellow-600">buttery</strong>
				&nbsp;text editor for notes and documents on the web
			</h2>
			<div className="flex flex-col md:flex-row gap-4 w-11/12 max-w-[1200px]
				items-center md:items-start justify-center py-4">
				<img src="https://vimnotion.com"
					className="md:basis-1/4"
					alt="vim motions" width={50} height={50} />
				<img src="https://vimnotion.com"
					className="md:basis-1/4"
					alt="split screens" width={50} height={50} />
				<img src="https://vimnotion.com"
					className="md:basis-1/4"
					alt="markdown" width={50} height={50} />
			</div>
			<h2 className="text-3xl italic">
				Rooted in <strong className="underline">Markdown</strong>&nbsp;
				and <strong className="underline">Vim</strong>&nbsp;
			</h2>
			<div className="flex flex-col md:flex-row gap-4 w-11/12 max-w-[1200px]
				items-center md:items-start justify-center py-4">
				<div className="border border-foreground-muted/70 md:basis-1/3 p-4 flex flex-col 
					justify-center items-center rounded-xs">
					<h3 className="italic text-xl text-center">
						Simple, beautiful documents in Markdown
					</h3>
				</div>
				<div className="border border-foreground-muted/70 md:basis-1/3 p-4 flex flex-col 
					justify-center items-center rounded-xs">
					<h3 className="italic text-xl text-center">
						With the buttery smoothness of Vim motions
					</h3>
				</div>
			</div>

		</div>
	);
}
