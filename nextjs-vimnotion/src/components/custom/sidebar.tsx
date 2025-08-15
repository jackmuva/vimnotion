import { fetcher } from '@/lib/utils';
import useSWR from 'swr'

export const Sidebar = () => {
	const { data, error, isLoading } = useSWR(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/personal-directory`, fetcher);
	console.log("data: ", data);
	console.log("error: ", error);
	console.log("cookie: ", document.cookie);

	return (
		<div className="h-full w-96 pt-14 p-4 bg-background-muted/10 flex flex-col items-center">
			{!error && <a id="sidebar" className="border-2 rounded-sm cursor-pointer bg-foreground-muted/50 
				hover:bg-background-muted/50 flex items-center justify-center py-1 px-2 w-fit 
				space-x-2" href={`https://github.com/login/oauth/authorize?scope=read:user,user:email&
						client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}`}>
				<img src={"./github-logo.png"} className="h-8 w-8" />
				<p>login to save pages</p>
			</a>}
		</div>
	);
}
