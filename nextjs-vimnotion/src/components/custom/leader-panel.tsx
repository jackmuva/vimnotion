export const LeaderPanel = ({ paneId }: { paneId: string }) => {
	return (
		<div id={`leader-panel-${paneId}`}
			className='w-full bg-background-muted/50 h-1/4 absolute bottom-0 left-0 
					m-1 rounded-sm grid grid-cols-1 md:grid-cols-2 p-4'>
			<div>
				<button id={`first-leader-option-${paneId}`} className="cursor-pointer">[m]</button>arkdown
			</div>
			<div>

			</div>
		</div>
	);

}
