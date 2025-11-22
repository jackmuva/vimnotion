import { useEditorStore } from "@/store/editor-store";
import { useEffect, useRef, useState } from "react";

export const ImageModal = () => {
	const { toggleImageModal } = useEditorStore((state) => state);
	const [imagePresent, setImagePresent] = useState<boolean>(false);
	const [imageBuffer, setImageBuffer] = useState<string | ArrayBuffer | null>(null);
	const imagePresentRef = useRef(imagePresent);

	useEffect(() => {
		imagePresentRef.current = imagePresent;
	}, [imagePresent]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				toggleImageModal();
			}
		}
		document.addEventListener('keydown', handleKeyDown);
		const handleYKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'y' && imagePresentRef.current) {
			}
		}
		document.addEventListener('keydown', handleYKeyDown);
		const handleNKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'n' && imagePresentRef.current) {
				toggleImageModal();
			}
		}
		document.addEventListener('keydown', handleNKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keydown', handleYKeyDown);
			document.removeEventListener('keydown', handleNKeyDown);
		}
	}, []);

	useEffect(() => {
		let contentTarget = document.getElementById("imageUpload");

		if (!contentTarget) return;
		contentTarget.onpaste = (e: ClipboardEvent) => {
			e.preventDefault();
			if (!e.clipboardData) return;
			let cbPayload = [...(e.clipboardData).items];
			cbPayload = cbPayload.filter(i => /image/.test(i.type));

			if (!cbPayload.length || cbPayload.length === 0) return false;

			let reader = new FileReader();
			reader.onload = (e: ProgressEvent<FileReader>) => {
				e.preventDefault();
				if (!e || !e.target) return;
				setImageBuffer(e.target.result);
				setImagePresent(true);
			}
			const file = cbPayload[0].getAsFile();
			if (!file) return;
			reader.readAsDataURL(file);
		};

		return () => {
			if (contentTarget) contentTarget.onpaste = null;
		}
	}, []);

	useEffect(() => {
		if (imagePresent) {
			const button = document.getElementById("image-confirmation-option");
			if (button) button.focus();
		}
	}, [imagePresent])

	return (
		<div className="font-pixel text-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
			z-30 bg-background h-96 max-w-11/12 w-[700px] p-4 
			flex flex-col justify-between outline  outline-offset-2 
			outline-foreground-muted/50">
			<div className="h-full w-full flex flex-col justify-between">
				{!imagePresent ? (
					<div id="imageUpload"
						className={`w-full outline-dotted outline-foreground-muted/50
					p-3 grow mb-4 text-foreground
					before:content-[attr(data-placeholder)]
					before:text-foreground-muted/70
					focus:before:text-transparent
					flex items-center justify-center
					empty:before:block
					before:pointer-events-none`}
						contentEditable={true}
						data-placeholder="paste or drag a picture here" />
				) : (
					<div className="mb-4 overflow-x-scroll
							overflow-y-scroll flex 
							justify-center items-center
							h-full w-full">
						<img src={String(imageBuffer)} />
					</div>
				)}
				<div className="w-full flex gap-8 justify-center text-2xl">
					{imagePresent ? (<>
						<div>
							<button
								id="image-confirmation-option"
								className="cursor-pointer"
								onClick={
									() => {
									}
								}>
								<span className="font-bold text-orange-500">[y]</span>
							</button>es, add this image
						</div>
						<div>
							<button
								className="cursor-pointer"
								onClick={
									() => {
									}
								}>
								<span className="font-bold text-orange-500">[n]</span>
							</button>o, cancel
						</div>

					</>) : (<>
						<div>
							<button
								className="cursor-pointer"
								id="first-image-option"
								onClick={
									() => {
									}
								}>
								<span className="font-bold text-orange-500">[u]</span>
							</button>pload image
						</div>
					</>)
					}
				</div >

			</div >

		</div >
	);

}
