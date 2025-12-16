"use server";

import Link from "next/link";

export default async function BlogPage() {
	return (
		<div className="px-2 h-dvh w-dvw pt-20 flex flex-col items-center">
			<div className="flex flex-col w-full max-w-[1100px] gap-10">
				<h1 className="text-2xl font-bold">
					The vimnotion blog
				</h1>
				<div className="flex flex-col gap-8 text-base ">
					<Link href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/blog/vim-based-note-taker`}
						target="_self" className="flex flex-col gap-2 border-b border-b-foreground/30
						pb-2 hover:text-foreground/30">
						<div className="flex w-full justify-between items-center">
							<h2 className="text-xl">
								Search for a Vim-based Note Taker
							</h2>
							<div>
								Published: December 15, 2025
							</div>
						</div>
						<div>
							Written by: Jack
						</div>
						<div className="text-sm lineclamp-3">
							Once I got comfortable with Vim as an IDE, I knew I wanted a Vim-based note taker. I&quot;ve looked far and wide...
						</div>
					</Link>
					<Link href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/blog/dear-vim`}
						target="_self" className="flex flex-col gap-2 border-b border-b-foreground/30
						pb-2 hover:text-foreground/30">
						<div className="flex w-full justify-between items-center">
							<h2 className="text-xl">
								Dear Vim
							</h2>
							<div>
								Published: December 12, 2025
							</div>
						</div>
						<div>
							Written by: Jack
						</div>
						<div className="text-sm lineclamp-3">
							20% parody, 100% real, this letter based off Kobe Bryant&quot;s &apos;Dear Basketball&apos; is for Vim.
						</div>
					</Link>
					<Link href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/blog/modern-day-folk-craft`}
						target="_self" className="flex flex-col gap-2 border-b border-b-foreground/30
						pb-2 hover:text-foreground/30">
						<div className="flex w-full justify-between items-center">
							<h2 className="text-xl">
								Software and the Modern Day Folk Crafts
							</h2>
							<div>
								Published: November 9, 2025
							</div>
						</div>
						<div>
							Written by: Jack
						</div>
						<div className="text-sm lineclamp-3">
							Inspired by an essay from Soetsu Yanagi&quot;s &apos;The Beauty of Everyday Things,&apos;
							This is taking the ethos of folkcraft into software.
						</div>
					</Link>

				</div>
			</div>
		</div>
	);
}
