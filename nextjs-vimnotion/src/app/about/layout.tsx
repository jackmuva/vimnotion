import { MarketingHeader } from "@/components/marketing-pages/marketing-header"

export default function BlogLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className="font-libre text-lg">
			<MarketingHeader />
			{children}
		</div>
	)

}
