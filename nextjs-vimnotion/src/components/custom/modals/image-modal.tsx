import { useEditorStore } from "@/store/editor-store";
import { useEffect, useRef, useState } from "react";

const base64ToBinary = (base64: string): Uint8Array => {
	const binaryString = atob(base64);
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes;
}

const getContentTypeFromDataUri = (dataUri: string): string => {
	const match = dataUri.match(/^data:([^;]+);/);
	return match ? match[1] : 'application/octet-stream';
}

export const ImageModal = () => {
	const toggleImageModal = useEditorStore((state) => state.toggleImageModal);
	const setNewImageUrl = useEditorStore((state) => state.setNewImageUrl);
	const [imagePresent, setImagePresent] = useState<boolean>(false);
	const [imageBuffer, setImageBuffer] = useState<string | ArrayBuffer | null>(null);
	const imagePresentRef = useRef(imagePresent);
	const imageFile = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		imagePresentRef.current = imagePresent;
	}, [imagePresent]);


	const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (!event || !event.target || !event.target.files) return;
		const file = event.target.files[0];
		const fileReader = new FileReader();

		fileReader.readAsDataURL(file)
		fileReader.onload = () => {
			setImagePresent(true);
			setImageBuffer(fileReader.result);
		}
	}

	const uploadImage = () => {
		imageFile.current?.click();
	}

	const handleImageConfirm = async () => {
		if (!imageBuffer || typeof imageBuffer !== 'string') return;

		try {
			const contentType = getContentTypeFromDataUri(imageBuffer);
			const base64String = imageBuffer.split(',')[1];
			const binaryData = base64ToBinary(base64String);

			const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/image`, {
				method: 'POST',
				headers: { 'Content-Type': contentType },
				body: binaryData,
				credentials: "include",
			});

			if (!response.ok) {
				console.error('Failed to upload image');
				return;
			}

			const result: {
				StatusCode: number,
				Data: string,
			} = await response.json();
			console.log('Image uploaded:', result);

			setNewImageUrl(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/image/${result.Data}`);
			setImagePresent(false);
			setImageBuffer(null);
			toggleImageModal();
		} catch (error) {
			console.error('Error uploading image:', error);
		}
	}

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				toggleImageModal();
			}
		}
		document.addEventListener('keydown', handleKeyDown);
		const handleYKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'y' && imagePresentRef.current) {
				handleImageConfirm();
			}
		}
		document.addEventListener('keydown', handleYKeyDown);
		const handleNKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'n' && imagePresentRef.current) {
				event.preventDefault();
				event.stopImmediatePropagation();
				toggleImageModal();
			}
		}
		document.addEventListener('keydown', handleNKeyDown);

		const handleUKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'u' && !imagePresentRef.current) {
				uploadImage();
			}
		}
		document.addEventListener('keydown', handleUKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keydown', handleYKeyDown);
			document.removeEventListener('keydown', handleNKeyDown);
			document.removeEventListener('keydown', handleUKeyDown);
		}
	}, [toggleImageModal, handleImageConfirm]);

	useEffect(() => {
		const contentTarget = document.getElementById("imageUpload");

		if (!contentTarget) return;
		contentTarget.onpaste = (e: ClipboardEvent) => {
			e.preventDefault();
			if (!e.clipboardData) return;
			let cbPayload = [...(e.clipboardData).items];
			cbPayload = cbPayload.filter(i => /image/.test(i.type));

			if (!cbPayload.length || cbPayload.length === 0) return false;

			const reader = new FileReader();
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
	}, [imagePresent]);


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
								onClick={handleImageConfirm}>
								<span className="font-bold text-orange-500">[y]</span>
							</button>es, add this image
						</div>
						<div>
							<button
								className="cursor-pointer"
								onClick={() => {
									setImagePresent(false);
									setImageBuffer(null);
								}}>
								<span className="font-bold text-orange-500">[n]</span>
							</button>o, cancel
						</div>

					</>) : (<>
						<input type="file" id="image" style={{ display: 'none' }}
							ref={imageFile} accept="image/*"
							onChange={handleImage} />
						<div>
							<button
								className="cursor-pointer"
								id="first-image-option"
								onClick={
									() => { uploadImage(); }
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
