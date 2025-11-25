"use server";

import { VnObject } from "@/types/primitive-types";
import Markdown from "react-markdown";

export default async function DocHome({ params }: { params: Promise<{ fileId: string }> }) {
	const urlParams = await params;
	const res: Response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/vnobject/public/${urlParams.fileId}`, {
		method: "GET",
	});
	const vnData: { Data: VnObject[] } = await res.json();

	return (
		<div className="bg-background w-dvw h-dvh flex justify-center items-center pt-14 px-4 font-libre text-lg">
			<div className="top-0 left-0 border-b-2 border-background-muted/50 w-full flex justify-start items-center 
			z-40 absolute p-2 space-x-4 bg-background">
				<h1 className='font-pixel italic text-2xl font-bold'>vimnotion</h1>
			</div>
			<div id={`md-editor-${vnData.Data[0].id}`}
				className={`py-14 h-full max-w-[1100px] w-full overflow-y-scroll`}>
				<Markdown>
					{vnData.Data[0].contents}
				</Markdown>
			</div>

		</div>
	);

}
