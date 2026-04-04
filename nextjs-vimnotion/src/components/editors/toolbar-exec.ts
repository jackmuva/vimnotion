import { EditorType, PanelType, PaneNode } from "@/types/editor-types";

export class ToolbarExec {
  constructor(
    private splitVertical: () => void,
    private splitHorizontal: () => void,
    private closePane: () => void,
    private getActivePanel: () => PanelType,
    private saveVnObjectBuffer: () => Promise<boolean>,
    private setDirectoryConfirmation: () => void,
    private toggleSidebar: () => void,
    private renderMdTutor: () => void,
    private renderVimTutor: () => void,
    private refetchFileInBuffer: (fileId: string) => void,
    private getActivePane: () => string,
    private getPane: (paneId: string) => PaneNode,
    private updatePane: (paneNode: PaneNode) => void,
  ) { }
  async write() {
    const activePanel: PanelType = this.getActivePanel();
    const paneData = this.getPane(this.getActivePane())[this.getActivePane()];
    if (activePanel === PanelType.MAIN && paneData.editorType !== EditorType.AGENT) {
      await this.saveVnObjectBuffer();
    } else if (activePanel === PanelType.SIDEBAR) {
      this.setDirectoryConfirmation();
    }
  }

  update() {
    const activePanel: PanelType = this.getActivePanel();
    const paneData = this.getPane(this.getActivePane())[this.getActivePane()];
    if (activePanel === PanelType.MAIN && paneData.editorType !== EditorType.AGENT) {
      const pane: PaneNode = this.getPane(this.getActivePane());
      this.refetchFileInBuffer(pane[Object.keys(pane)[0]].fileId);
    }
  }

  quit() {
    const activePanel: PanelType = this.getActivePanel();
    const paneData = this.getPane(this.getActivePane())[this.getActivePane()];
    if (activePanel === PanelType.MAIN) {
      this.closePane();
    } else if (activePanel === PanelType.SIDEBAR) {
      this.setDirectoryConfirmation();
      this.toggleSidebar();
    }
  }

  saveAndQuit() {
    const activePanel: PanelType = this.getActivePanel();
    const paneData = this.getPane(this.getActivePane())[this.getActivePane()];
    if (activePanel === PanelType.MAIN && paneData.editorType !== EditorType.AGENT) {
      this.saveVnObjectBuffer();
      this.closePane();
    } else if (activePanel === PanelType.MAIN && paneData.editorType === EditorType.AGENT) {
      const fileId: string = this.getPane(this.getActivePane())[this.getActivePane()].fileId;
      if (fileId === "START_PAGE") {
        this.closePane();
      } else {
        this.updatePane({
          [this.getActivePane()]: {
            ...paneData,
            editorType: EditorType.VIM,
          }
        });
        this.refetchFileInBuffer(fileId);
      }
    } else if (activePanel === PanelType.SIDEBAR) {
      this.setDirectoryConfirmation();
    }
  }

  split() {
    const activePanel: PanelType = this.getActivePanel();
    if (activePanel === PanelType.MAIN) {
      this.splitHorizontal();
    }
  }

  vsplit() {
    const activePanel: PanelType = this.getActivePanel();
    if (activePanel === PanelType.MAIN) {
      this.splitVertical();
    }
  }

  mdTutor() {
    const activePanel: PanelType = this.getActivePanel();
    if (activePanel === PanelType.MAIN) {
      this.renderMdTutor();
    }
  }

  vimTutor() {
    const activePanel: PanelType = this.getActivePanel();
    if (activePanel === PanelType.MAIN) {
      this.renderVimTutor();
    }
  }
}
