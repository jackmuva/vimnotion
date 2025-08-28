import { useState } from "react";
import { WindowPanel } from "./window-panel";

export const LeaderPanel = ({ closePanel, toggleWindowPanel }:
	{ closePanel: () => void, toggleWindowPanel: () => void }) => {
	return (
		<div id={`leader-panel`}
			className='z-20 w-full bg-background-muted/50 h-1/4 absolute bottom-0 left-0 
					rounded-sm grid grid-cols-1 md:grid-cols-2 p-4 px-28'>
			<div>
				<button id={`first-leader-option`} className="cursor-pointer">[m]</button>arkdown
			</div>
			<div>
				<button className="cursor-pointer"
					onClick={() => {
						toggleWindowPanel();
						closePanel();
					}}>
					[w]
				</button>indow
			</div>
		</div>
	);

}
