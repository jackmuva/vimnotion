import { getChatSessions } from "@/services/api-service";
import { useEditorStore } from "@/store/editor-store";
import { ChatSession } from "@/types/primitive-types";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Message } from "../editors/agent-editor";
import { PaneNode } from "@/types/editor-types";
import { v4 } from "uuid";

export const SessionModal = () => {
	const [selectedIndex, setSelectedIndex] = useState<number>(0);
	const selectedIndexRef = useRef<number>(0);
	const sessionsRef = useRef<ChatSession[]>([]);
	const justMounted = useRef<boolean>(true);
	const toggleSessionModal = useEditorStore((state) => state.toggleSessionModal);
	const getPaneById = useEditorStore((state) => state.getPaneById);
	const updatePane = useEditorStore((state) => state.updatePane);
	const getActivePane = useEditorStore((state) => state.getActivePane);

	const { data: chatSessions, isLoading } = useSWR<ChatSession[]>(`/api/chat/session`, async () => {
		const sessions: ChatSession[] = await getChatSessions();
		return sessions;
	});

	useEffect(() => {
		selectedIndexRef.current = selectedIndex;
	}, [selectedIndex]);

	useEffect(() => {
		sessionsRef.current = chatSessions ?? [];
	}, [chatSessions]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
			}
		};
		document.addEventListener('keydown', handleKeyDown);

		const handleJKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'j') {
				event.preventDefault();
				event.stopImmediatePropagation();
				if (selectedIndexRef.current < Object.keys(sessionsRef.current).length - 1) {
					setSelectedIndex(selectedIndexRef.current + 1);
				}
			}
		};
		document.addEventListener('keydown', handleJKeyDown);

		const handleKKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'k') {
				event.preventDefault();
				event.stopImmediatePropagation();
				if (selectedIndexRef.current > 0) {
					setSelectedIndex(selectedIndexRef.current - 1);
				}
			}
		};
		document.addEventListener('keydown', handleKKeyDown);

		const handleCrKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Enter') {
				event.preventDefault();
				event.stopImmediatePropagation();
				if (justMounted.current) {
					justMounted.current = false;
					return;
				}
				const agentPane: PaneNode = getPaneById(getActivePane());
				updatePane({
					[Object.keys(agentPane)[0]]: {
						...agentPane[Object.keys(agentPane)[0]],
						agentState: {
							messages: sessionsRef.current ? sessionsRef.current[selectedIndexRef.current].messages : [],
							sessionId: sessionsRef.current ? sessionsRef.current[selectedIndexRef.current].sessionId : v4(),
							streaming: false,
							tokens: sessionsRef.current ? sessionsRef.current[selectedIndexRef.current].tokens : 0,
						}
					}
				});
				toggleSessionModal();
			}
		};
		document.addEventListener('keydown', handleCrKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keydown', handleJKeyDown);
			document.removeEventListener('keydown', handleKKeyDown);
			document.removeEventListener('keydown', handleCrKeyDown);
		}
	}, []);

	return (
		<div className="font-robo-mono text-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
			z-30 h-[600px] max-h-11/12 max-w-11/12 w-[900px] 
			flex flex-col items-center bg-background">
			<div className="w-full h-full flex gap-4">
				<div className={`flex-1 outline-offset-2 outline outline-foreground-muted/50 
					p-3 mb-4 overflow-y-auto`}
					low-data-tooltip="&quot;j&quot; and &quot;k&quot; to scroll, &quot;Enter&quot; to select">
					{chatSessions?.map((chatSession, i) => {
						return (
							<div key={i}
								className={`${selectedIndex === i ?
									"rounded-sm bg-foreground/10 " : ""}
								py-0.5 px-1 flex hover:cursor-pointer text-sm line-clamp-1 overflow-x-hidden
								whitespace-nowrap`}
								onClick={() => {
									const agentPane: PaneNode = getPaneById(getActivePane());
									updatePane({
										[Object.keys(agentPane)[0]]: {
											...agentPane[Object.keys(agentPane)[0]],
											agentState: {
												messages: chatSessions ? chatSessions[selectedIndexRef.current].messages : [],
												sessionId: chatSessions ? chatSessions[selectedIndexRef.current].sessionId : v4(),
												streaming: false,
												tokens: sessionsRef.current ? sessionsRef.current[selectedIndexRef.current].tokens : 0,
											}
										}
									});
									toggleSessionModal();
								}}>
								{new Date(chatSession.updateDate).toLocaleDateString() + ": " + chatSession.summary}
							</div>
						);
					})}
					{isLoading && <div className="animate-pulse w-full text-base">Loading...</div>}
				</div>
				<div className={`flex-1 outline-offset-2 
						outline outline-foreground-muted/50 p-3 mb-4 overflow-y-auto 
						text-xs whitespace-pre-wrap
						flex flex-col min-h-0 gap-2`}>
					{chatSessions && chatSessions[selectedIndex] && chatSessions[selectedIndex].messages.map((message, i) => {
						return <Message key={`${i}-${message.content?.length ?? 0}`} message={message} />
					})}
				</div>
			</div>
		</div>
	);
}
