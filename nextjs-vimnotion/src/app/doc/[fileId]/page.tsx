"use server";

import { MarketingHeader } from "@/components/marketing-pages/marketing-header";
import { CodeBlock } from "@/components/md-editor/code-block";
import { VnObject } from "@/types/primitive-types";
import { MarkdownAsync } from "react-markdown";
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default async function DocHome({ params }: { params: Promise<{ fileId: string }> }) {
	const urlParams = await params;
	const res: Response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/vnobject/public/${urlParams.fileId}`, {
		method: "GET",
	});
	const vnData: { Data: VnObject[] } = await res.json();

	return (
		<div className="bg-background px-2 w-full h-dvh flex justify-center items-center font-robo-slab text-lg flex-col">
			<MarketingHeader />
			<div id={`md-editor-${vnData.Data[0].id}`}
				className={`no-scrollbar pb-20 h-full max-w-[1100px] w-full overflow-y-scroll`}>
				{await MarkdownAsync({
					remarkPlugins: [[remarkGfm]],
					rehypePlugins: [[rehypeRaw]],
					components: {
						code: CodeBlock as any,
					},
					children: vnData.Data[0].contents,
				})}
			</div>

		</div>
	);

}
