import { GithubSignIn } from "./ui/github-sign-in";

export const SigninPage = () => {
  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div>
        Sign in with one of the following providers:
      </div>
      <GithubSignIn />
    </div>
  );
}
