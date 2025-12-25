"use server";

import Link from "next/link";

export default async function DocsNav() {

	return (
		<div className="flex gap-8 h-full items-center">
			<Link target="_self" href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/docs/editor`}
				className={`underline  font-robo-mono text-xl `}>
				Editor Features
			</Link>
			<Link target="_self" href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/docs/markdown`}
				className={`underline  font-robo-mono text-xl `}>
				Markdown Reference
			</Link>
			<Link target="_self" href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/docs/vim`}
				className={`underline  font-robo-mono text-xl `}>
				Vim Reference
			</Link>
		</div>
	);
}
