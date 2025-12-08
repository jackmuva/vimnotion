import { MarketingHeader } from "@/components/custom/marketing-header"
import Link from "next/link"

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
