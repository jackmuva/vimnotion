import { signIn } from "@/auth"

export function GithubSignIn() {
	return (
		<form
			action={async () => {
				"use server"
				await signIn("github")
			}}
		>
			<button type="submit">Sign in</button>
		</form>
	)
}
