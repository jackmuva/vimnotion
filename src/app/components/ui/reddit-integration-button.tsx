"use client";

export const RedditButton = () => {
	const postReddit = async () => {
		const req = await fetch(window.location.origin + "/api/reddit", {
			method: "POST",
		});
		const res = await req.json();
		console.log(res);
	}

	return (
		<div>
			<button onClick={() => postReddit()}>post</button>
		</div>
	);
}
