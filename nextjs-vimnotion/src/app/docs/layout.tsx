import DocsNav from "@/components/custom/docs/docs-nav"
import { MarketingHeader } from "@/components/custom/marketing-pages/marketing-header"

export default function DocsLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className="font-libre text-lg h-dvh w-dvw flex flex-col items-center">
			<MarketingHeader />
			<div className="flex flex-col pt-4 w-full max-w-[1100px] gap-4">
				<DocsNav />
				{children}
			</div>
		</div>
	)

}
