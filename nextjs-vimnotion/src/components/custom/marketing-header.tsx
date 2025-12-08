import Link from "next/link";

export const MarketingHeader = () => {
	return (
		<div className="top-0 left-0 border-b-2 border-background-muted/50 w-full flex justify-between 
				items-center z-40 absolute p-2 space-x-4 bg-background gap-4 h-14">
			<Link target="_self" href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}`}
				className='font-bold font-pixel text-2xl italic'>
				VimNotion
			</Link>
			<div className="flex gap-4 h-full items-center">
				<Link target="_self" href={`https://github.com/login/oauth/authorize?scope=read:user,user:email&
						client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}`}
					className='font-bold font-pixel text-xl px-2 h-8
					border-yellow-600 text-[#151515] border-b-4 border bg-[#ffd497]
					hover:border-b-2 hover:translate-y-0.5'>
					start
				</Link>
				<Link target="_self" href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/blog`}
					className='underline font-bold font-pixel text-xl italic'>
					blog
				</Link>
			</div>
		</div>

	);
}
