"use server";

import Link from "next/link";

export default async function BlogPage() {
	return (
		<div className="px-2 h-dvh w-dvw pt-20 flex flex-col items-center">
			<div className="flex flex-col w-full max-w-[1100px] gap-10">
				<h1 className="italic text-2xl font-bold">
					The vimnotion blog
				</h1>
				<div className="flex flex-col gap-2 text-base ">
					<Link href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/blog/modern-day-folk-craft`}
						target="_self" className="flex flex-col gap-2 border-b border-b-foreground/30
						pb-2 hover:text-foreground/30">
						<h2 className="text-xl">
							Software and the Modern Day Folk Crafts
						</h2>
						<div className="flex w-full justify-between items-center">
							<div>
								Written by: Jack
							</div>
							<div>
								Published: November 9, 2025
							</div>
						</div>
						<div className="text-sm lineclamp-3">

						</div>
					</Link>
				</div>
			</div>
		</div>
	);
}
