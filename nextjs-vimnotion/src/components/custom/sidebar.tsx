import { useEffect, useState } from "react";

export const Sidebar = () => {
	const [authenticated, setAuthenticated] = useState<boolean>(false);

	useEffect(() => {
		if (!localStorage.getItem("authenticated")) {
			fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/check`, {
				method: "GET"
			}).then((authReq) => {
				authReq.json().then((authRes) => {
					if (authRes.ok) {
						localStorage.setItem("authenticated", "true");
						setAuthenticated(true);
					}
				}).then((err) => {
					throw Error("unable to authenticate" + err);
				});
			}).catch((err) => {
				console.error(err);
				localStorage.setItem("authenticated", "false");
			});;
		} else if (localStorage.getItem("authenticated") === "true") {
			setAuthenticated(true);
		}
	}, []);

	return (
		<div className="h-full w-96 pt-14 p-4 bg-background-muted/10 flex flex-col items-center">
			{!authenticated && <a id="sidebar" className="border-2 rounded-sm cursor-pointer bg-foreground-muted/50 
				hover:bg-background-muted/50 flex items-center justify-center py-1 px-2 w-fit 
				space-x-2" href={`https://github.com/login/oauth/authorize?scope=user&
						client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}`}>
				<img src={"./github-logo.png"} className="h-8 w-8" />
				<p>login to save pages</p>
			</a>}
		</div>
	);
}
