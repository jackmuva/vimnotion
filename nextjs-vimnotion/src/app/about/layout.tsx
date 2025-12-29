import { MarketingHeader } from "@/components/marketing-pages/marketing-header"

export default function AboutLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className="font-robo-slab text-lg">
			<MarketingHeader />
			{children}
		</div>
	)

}
