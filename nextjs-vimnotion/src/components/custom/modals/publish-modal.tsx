import { useEditorStore } from "@/store/editor-store";
import { PaneNode } from "@/types/editor-types";
import { useEffect } from "react";

export const PublishModal = () => {
	const { activePane, getPaneById, publishVnObject,
		togglePublishModal } = useEditorStore((state) => state);
	const activeTree: PaneNode = getPaneById(activePane);

	const togglePub = () => {
		publishVnObject(!activeTree[Object.keys(activeTree)[0]].public)
	}

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				togglePublishModal();
			}
		}
		document.addEventListener('keydown', handleKeyDown);
		const handleYKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'y') {
				event.preventDefault();
				event.stopImmediatePropagation();
				togglePub();
			}
		}
		document.addEventListener('keydown', handleYKeyDown);
		const handleNKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'n') {
				event.preventDefault();
				event.stopImmediatePropagation();
				togglePublishModal();
			}
		}
		document.addEventListener('keydown', handleNKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keydown', handleYKeyDown);
			document.removeEventListener('keydown', handleNKeyDown);
		}
	}, [togglePublishModal, activeTree]);


	return (
		<div className="font-pixel text-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
			z-30 bg-background h-48 max-w-11/12 w-[700px] p-4 
			flex flex-col justify-between outline  outline-offset-2 
			outline-foreground-muted/50">
			<div className="h-full w-full flex flex-col p-4 border border-foreground-muted/50 mb-2 justify-center">
				{activeTree[activePane].public ? `Published at ` : "Currently private"}
				{activeTree[activePane].public && <a href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/doc/${activeTree[activePane].fileId}`}
					target="_blank" className="line-clamp-1 text-indigo-500 hover:underline">
					{process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/doc/${activeTree[activePane].fileId}
				</a>}
			</div>
			<div className="w-full flex gap-8 justify-center text-2xl">
				<div>
					<button
						id="first-publish-option"
						className="cursor-pointer"
						onClick={() => {
							togglePub();
						}}>
						<span className="font-bold text-orange-500">[y]</span>
					</button>es, {activeTree[activePane].public ? "unpublish" : "publish!"}
				</div>
				<div>
					<button
						className="cursor-pointer"
						onClick={() => {
							togglePublishModal();
						}}>
						<span className="font-bold text-orange-500">[n]</span>
					</button>o, cancel
				</div>

			</div>
		</div>
	);
}
