import { useEffect, useState } from "react";

export const Sidebar = () => {
	const [authenticated, setAuthenticated] = useState<boolean>(false);

	useEffect(() => {
		if (!localStorage.getItem("authenticated")) {
			fetch(`${process.env.BACKEND_BASE_URL}/api/auth/check`, {
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
			{!authenticated && <button id="sidebar" className="border-2 rounded-sm cursor-pointer bg-foreground-muted/50 
				hover:bg-background-muted/50 flex items-center justify-center py-1 px-2 w-fit 
				space-x-2">
				<img src={"./github-logo.png"} className="h-8 w-8" />
				<p>login to save pages</p>
			</button>}
		</div>
	);
}
