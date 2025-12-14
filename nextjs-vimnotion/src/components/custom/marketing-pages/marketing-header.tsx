import Link from "next/link";
import { StartButtonOverlay } from "./start-button-overlay";

export const MarketingHeader = () => {
	return (
		<div className="top-0 left-0 border-b-2 border-background-muted/50 w-full flex justify-between 
				items-center z-40 absolute p-2 space-x-4 bg-background gap-4 h-14">
			<Link target="_self" href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}`}
				className='font-bold font-pixel text-2xl italic'>
				VimNotion
			</Link>
			<div className="flex gap-4 h-full items-center">
				<StartButtonOverlay variant="sm" />
				<Link target="_self" href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/docs/editor`}
					className='underline font-bold font-pixel text-xl italic'>
					docs
				</Link>
				<Link target="_self" href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/blog`}
					className='underline font-bold font-pixel text-xl italic'>
					blog
				</Link>
			</div>
		</div>

	);
}
