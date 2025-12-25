import Link from "next/link";
import { StartButtonOverlay } from "./start-button-overlay";

export const MarketingHeader = () => {
	return (
		<div className="sticky top-0 left-0 border-b-2 border-background-muted/50 w-full flex justify-between 
				items-center z-40 p-2 space-x-4 bg-background gap-4 h-14">
			<Link target="_self" href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}`}
				className='font-robo-mono text-xl font-bold'>
				VimNotion
			</Link>
			<div className="flex gap-4 h-full items-center">
				<StartButtonOverlay variant="sm" />
				<Link target="_self" href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/docs/editor`}
					className='underline font-robo-mono text-lg '>
					docs
				</Link>
				<Link target="_self" href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/blog`}
					className='underline font-robo-mono text-lg '>
					blog
				</Link>
				<Link target="_self" href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/about`}
					className='underline font-robo-mono text-lg '>
					about
				</Link>
			</div>
		</div>

	);
}
