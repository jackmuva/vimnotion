import { MarketingHeader } from "@/components/marketing-pages/marketing-header";
import { VnObject } from "@/types/primitive-types";
import { DocContent } from "./doc-content";

export default async function DocHome({ params }: { params: Promise<{ fileId: string }> }) {
	const urlParams = await params;
	const res: Response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/vnobject/public/${urlParams.fileId}`, {
		method: "GET",
	});
	const vnData: { Data: VnObject[] } = await res.json();

	return (
		<div className="bg-background px-2 w-full h-dvh flex justify-center items-center font-robo-slab text-lg flex-col">
			<MarketingHeader />
			<DocContent id={vnData.Data[0].id} content={vnData.Data[0].contents} />
		</div>
	);
}
