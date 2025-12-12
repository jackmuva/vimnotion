"use server";

import Image from "next/image";
import Link from "next/link";

export default async function FolkCraftPage() {
	return (
		<div className="h-dvh w-dvw px-2 pt-20 flex flex-col items-center">
			<div id="md-editor-blog" className="flex flex-col w-full max-w-[1100px] gap-4 overflow-y-auto 
				pb-20 px-4">
				<div className="flex flex-col gap-2">
					<div className="flex flex-col gap-4">
						<Link target="_self" href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/blog`}
							className="hover:text-foreground/30">
							{"< Back to blog"}
						</Link>
						<div className="text-base flex w-full justify-between items-center 
							border-b border-b-foreground/30
						pb-2">
							<div>
								Written by: Jack
							</div>
							<div>
								Published: November 9, 2025
							</div>
						</div>
						<div className="text-sm lineclamp-3">

						</div>
					</div>
				</div>
				<h1>
					Dear Vim
				</h1>
				<div>
					Dear Vim,
				</div>

			</div>
		</div>
	);
}
