import { uploadImageToBackend } from "@/services/api-service";
import FileHandler from "@tiptap/extension-file-handler";

export const CustomFileHandler = FileHandler.configure({
	allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
	onDrop: async (currentEditor, files, pos) => {
		for (const file of files) {
			try {
				const fileReader = new FileReader()

				fileReader.readAsDataURL(file)
				fileReader.onload = async () => {
					if (!fileReader.result || typeof fileReader.result !== 'string') return;
					const result = await uploadImageToBackend(fileReader.result);
					currentEditor
						.chain()
						.insertContentAt(pos, {
							type: 'image',
							attrs: {
								src: `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/image/${result.Data}`,
								alt: "new-image",
							},
						})
						.focus()
						.run()
				}
			} catch (error) {
				console.error('Failed to upload dropped image:', error);
			}
		}
	},
	onPaste: async (currentEditor, files, htmlContent) => {
		for (const file of files) {
			if (htmlContent) return false;
			try {
				const fileReader = new FileReader()
				fileReader.readAsDataURL(file)
				fileReader.onload = async () => {
					if (!fileReader.result || typeof fileReader.result !== 'string') return;
					const result = await uploadImageToBackend(fileReader.result);
					currentEditor
						.chain()
						.insertContentAt(currentEditor.state.selection.anchor, {
							type: 'image',
							attrs: {
								src: `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/image/${result.Data}`,
								alt: "new-image"
							},
						})
						.focus()
						.run()
				}
			} catch (error) {
				console.error('Failed to upload pasted image:', error);
			}
		}
	},
});
