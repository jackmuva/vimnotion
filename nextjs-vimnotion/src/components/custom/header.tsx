import { useEditorStore } from '@/store/editor-store';
import { Menu } from 'lucide-react';

export const Header = () => {
	const toggleSidebar = useEditorStore((state) => state.toggleSidebar);
	return (
		<div className="top-0 left-0 border-b-2 border-background-muted/50 w-full flex justify-start items-center 
			z-40 absolute p-2 space-x-4 bg-background">
			<button className='hover:bg-background-muted/50 p-1 cursor-pointer rounded-sm'
				onClick={() => toggleSidebar()}>
				<Menu size={17} />
			</button>
			<h1 className='font-pixel italic text-2xl font-bold'>vimnotion</h1>
		</div>
	);
}
