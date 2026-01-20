import { MarketingHeader } from "@/components/marketing-pages/marketing-header";
import { VnObject } from "@/types/primitive-types";
import { DocContent } from "./doc-content";
import { getVnObjectById } from "@/services/api-service";

export default async function DocHome({ params }: { params: Promise<{ fileId: string }> }) {
	const urlParams = await params;
	const vnData: VnObject | null = await getVnObjectById(urlParams.fileId, true);

	return (
		<div className="bg-background px-2 w-full h-dvh flex justify-center items-center font-robo-slab text-lg flex-col">
			<MarketingHeader />
			{vnData && <DocContent id={vnData?.id} content={vnData?.contents} />}
		</div>
	);
}
