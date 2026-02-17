import { create } from 'zustand'
import { ToggleSlice, createToggleSlice } from './slices/toggle-store';
import { PanelSlice, createPanelSlice } from './slices/panel-store';
import { TabSlice, createTabSlice } from './slices/tab-store';
import { DirectorySlice, createDirectorySlice } from './slices/directory-store';
import { SearchSlice, createSearchSlice } from './slices/search-store';
import { AgentSlice, createAgentSlice } from './slices/agent-store';

export type EditorState =
	ToggleSlice &
	PanelSlice &
	TabSlice &
	DirectorySlice &
	SearchSlice &
	AgentSlice;

export const useEditorStore = create<EditorState>((set, get) => ({
	...createToggleSlice(set, get),
	...createPanelSlice(set, get),
	...createTabSlice(set, get),
	...createDirectorySlice(set, get),
	...createSearchSlice(set, get),
	...createAgentSlice(set, get),
}));
