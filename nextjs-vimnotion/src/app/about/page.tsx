"use server";

export default async function AboutPage() {
	return (

		<div className="px-2 h-dvh w-dvw pt-20 flex flex-col items-center">
			<div className="flex flex-col w-full max-w-[1100px] gap-10">
				<h1 className="text-3xl font-bold">
					About VimNotion
				</h1>
				<div>
					VimNotion is an ode to vim, bringing vim functionality to
					a Notion-like notes and document editor. VimNotion&quot;s opinionated

				</div>
			</div>
		</div>
	);
}
