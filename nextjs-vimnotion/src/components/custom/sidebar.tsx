import useSWR from 'swr'

export const Sidebar = () => {
	const { data, isLoading } = useSWR(`/api/personal-directory`, async () => {
		const req = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/personal-directory`,
			{
				credentials: 'include'
			});
		return await req.json();
	});

	return (
		<div className="h-full w-96 pt-14 p-4 bg-background-muted flex flex-col items-center 
			z-30 absolute top-0 left-0">
			{data?.StatusCode === 401 && <a id="sidebar" className="border-2 rounded-sm cursor-pointer bg-foreground-muted/50 
				hover:bg-background-muted/50 flex items-center justify-center py-1 px-2 w-fit 
				space-x-2" href={`https://github.com/login/oauth/authorize?scope=read:user,user:email&
						client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}`}>
				<img src={"./github-logo.png"} className="h-8 w-8" />
				<p>login to save pages</p>
			</a>}
		</div>
	);
}
