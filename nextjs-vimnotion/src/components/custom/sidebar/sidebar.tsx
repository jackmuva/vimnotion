import { SidebarData } from '@/types/sidebar-types';
import { useEffect } from 'react';
import { SidebarEditor } from './sidebar-editor';



export const Sidebar = ({
	openSidebar,
	sidebarData,
	sidebarDataIsLoading,
}: {
	openSidebar: boolean,
	closeSidebar: () => void,
	sidebarData: SidebarData | undefined,
	sidebarDataIsLoading: boolean,
}) => {
	useEffect(() => {
		if (openSidebar) {
			const button = document.getElementById('sidebar');
			if (button) {
				button.focus();
			}
		}
	}, [openSidebar, sidebarData]);

	return (
		<div className={`h-full w-96 pt-24 p-4 bg-secondary-background flex flex-col 
			items-center z-30 absolute top-0 left-0 
			${(sidebarData && sidebarData.StatusCode === 401) ? 'justify-center' : 'justify-start'}`}>
			{sidebarData?.StatusCode === 401 &&
				<a id="sidebar" className="border-2 rounded-sm cursor-pointer bg-foreground-muted/50 
				hover:bg-background-muted/50 flex items-center justify-center py-1 px-2 w-fit 
				space-x-2" href={`https://github.com/login/oauth/authorize?scope=read:user,user:email&
						client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}`}>
					<img src={"./github-logo.png"} className="h-8 w-8" />
					<p>login to save pages</p>
				</a>}
			{sidebarDataIsLoading &&
				<div className='animate-bounce'>loading...</div>
			}
			{!sidebarDataIsLoading && sidebarData && sidebarData.StatusCode === 200 &&
				<SidebarEditor data={sidebarData} />
			}
		</div>
	);
}
