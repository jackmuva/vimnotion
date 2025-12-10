"use client";

import Image from "next/image";
import { useState } from "react";

export const StartButtonOverlay = ({
	variant
}: {
	variant: "sm" | "normal",
}) => {
	const buttonStyle = variant === "sm" ? `font-bold font-pixel text-xl px-2 h-8
					border-yellow-600 text-[#151515] border-b-4 border bg-[#ffd497]
					hover:border-b-2 hover:translate-y-0.5` :
		`font-bold font-pixel text-3xl px-4 h-12
					border-yellow-600 text-[#151515] border-b-8 border-2 bg-[#ffd497]
					hover:border-b-4 hover:translate-y-1 flex items-center`;
	const [overlay, setOverlay] = useState<boolean>(false);
	const googleParams = new URLSearchParams();
	googleParams.append('client_id', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!);
	googleParams.append('redirect_uri', process.env.NEXT_PUBLIC_BACKEND_BASE_URL! + "/oauth/google/callback");
	googleParams.append('response_type', 'code');
	googleParams.append('scope', 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid');
	googleParams.append('include_granted_scopes', 'true');

	return (
		<>
			<button className={buttonStyle}
				onClick={() => setOverlay(true)}>
				<div>
					Start
				</div>
			</button>
			{overlay && <div className="fixed top-0 left-0 w-dvw h-dvh bg-background/70 z-20"
				onClick={() => { setOverlay(false) }}>
				<div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
				z-30 h-[300px] max-h-11/12 max-w-11/12 w-[500px] pt-14 p-4 
				flex flex-col items-center bg-background
				outline outline-offset-2 outline-foreground-muted/50">
					<h1 className="font-pixel text-4xl font-bold italic mb-10">
						Login to VimNotion
					</h1>
					<div className="flex flex-col gap-4">
						<a className="border-2 rounded-sm cursor-pointer bg-foreground-muted/30 
							hover:bg-background-muted/50 flex items-center justify-center py-1 px-2 w-full
							space-x-2"
							href={`https://accounts.google.com/o/oauth2/v2/auth?${googleParams.toString()}`}>
							<Image alt="google logo" src={"/google-logo.png"} height={20} width={40} />
							<p>Login with Google</p>
						</a>
						<a className="border-2 rounded-sm cursor-pointer bg-foreground-muted/30 
							hover:bg-background-muted/50 flex items-center justify-center py-1 px-2 w-full 
							space-x-2"
							href={`https://github.com/login/oauth/authorize?scope=read:user,user:email&
						client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}`}>
							<Image alt="github logo" src={"/github-logo.png"} height={20} width={20} />
							<p>Login with Github</p>
						</a>
					</div>
				</div>
			</div>}
		</>
	);
}
