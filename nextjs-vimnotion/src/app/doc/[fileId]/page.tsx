import { MarketingHeader } from "@/components/marketing-pages/marketing-header";
import { Suggestion, VnObject } from "@/types/primitive-types";
import { DocContent } from "./doc-content";
import { getVnObjectById } from "@/services/api-service";

export default async function DocHome({ params }: { params: Promise<{ fileId: string }> }) {
	const urlParams = await params;
	const vnData: { file: VnObject | null, suggestions: Suggestion[] } | null = await getVnObjectById(urlParams.fileId, true);

	return (
		<div className="bg-background px-2 w-full h-dvh flex justify-center items-center font-robo-slab text-lg flex-col">
			<MarketingHeader />
			{vnData && vnData.file && <DocContent id={vnData.file.id} content={vnData.file.contents} />}
		</div>
	);
}
