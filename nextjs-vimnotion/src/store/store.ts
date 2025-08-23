import { create } from 'zustand'

export const useStore = create((set) => ({
	activePane: "root",
	resetPane: () => set({ activePane: "root" }),
	updateActivePane: (newPane: string) => set({ activePane: newPane }),
}))
