import { SidebarData } from '@/types/sidebar-types';
import { useEffect } from 'react';
import { SidebarEditor } from './sidebar-editor';
import { useEditorStore } from '@/store/editor-store';
import Image from 'next/image';



export const Sidebar = ({
	sidebarData,
	sidebarDataIsLoading,
}: {
	sidebarData: SidebarData | undefined,
	sidebarDataIsLoading: boolean,
}) => {
	const { openSidebar } = useEditorStore((state) => state);
	useEffect(() => {
		if (openSidebar) {
			const button = document.getElementById('sidebar');
			if (button) {
				button.focus();
			}
		}
	}, [openSidebar, sidebarData]);

	return (
		<div className={`h-full w-96 pt-16 p-2 bg-secondary-background flex flex-col 
			items-center z-30 absolute top-0 left-0 
			${(sidebarData && sidebarData.StatusCode === 401) ? 'justify-center' : 'justify-start'}`}>
			{sidebarData?.StatusCode === 401 &&
				<a id="sidebar" className="border-2 rounded-sm cursor-pointer bg-foreground-muted/50 
				hover:bg-background-muted/50 flex items-center justify-center py-1 px-2 w-fit 
				space-x-2" href={`https://github.com/login/oauth/authorize?scope=read:user,user:email&
						client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}`}>
					<Image alt="github logo" src={"/github-logo.png"} height={20} width={20} />
					<p>login to save pages</p>
				</a>}
			{sidebarDataIsLoading &&
				<div className='animate-bounce'>loading...</div>
			}
			{!sidebarDataIsLoading && sidebarData && sidebarData.StatusCode === 200 &&
				<SidebarEditor />
			}
		</div>
	);
}
