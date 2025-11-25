"use server";

import { VnObject } from "@/types/primitive-types";

export default async function DocHome({ params }: { params: { fileId: string } }) {
	console.log("fileid: ", params.fileId);
	const res: Response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/vnobject/public/${params.fileId}`, {
		method: "GET",
	});
	const vnData: { Data: VnObject } = await res.json();
	console.log(vnData.Data);

	return (
		<div className="bg-background w-dvw h-dvh flex justify-center items-center pt-14 px-4 font-libre text-lg">
			<div className="top-0 left-0 border-b-2 border-background-muted/50 w-full flex justify-start items-center 
			z-40 absolute p-2 space-x-4 bg-background">
				<h1 className='font-pixel italic text-2xl font-bold'>vimnotion</h1>
			</div>
		</div>
	);

}
