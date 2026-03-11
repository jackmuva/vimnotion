import { create } from 'zustand'
import { createToggleSlice } from './slices/toggle-store';
import { createPanelSlice } from './slices/panel-store';
import { createTabSlice } from './slices/tab-store';
import { createDirectorySlice } from './slices/directory-store';
import { createSearchSlice } from './slices/search-store';
import { EditorState } from '../types/store-types';

// Re-export types for external consumers
export type { EditorState, DrillDownResult } from '../types/store-types';

export const useEditorStore = create<EditorState>((set, get) => ({
	...createToggleSlice(set, get),
	...createPanelSlice(set, get),
	...createTabSlice(set, get),
	...createDirectorySlice(set, get),
	...createSearchSlice(set, get),
}));
