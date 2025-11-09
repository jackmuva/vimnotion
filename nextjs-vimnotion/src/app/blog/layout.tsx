import Link from "next/link"

export default function BlogLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className="font-custom text-lg">
			<div className="top-0 left-0 border-b-2 border-background-muted/50 w-full flex justify-start items-center 
			z-40 absolute p-2 space-x-4 bg-background">
				<Link target="_self" href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}`}
					className='font-semibold italic'>
					vimnotion
				</Link>
			</div>
			{children}
		</div>
	)

}
