import { auth } from "@/auth";
import { Session } from "next-auth";
import { Dashboard } from "./components/dashboard";
import { SigninPage } from "./components/signin-page";

export default async function Home() {
  const session: Session | null = await auth()
  console.log(session);
  if (session) {
    return (
      <div className="flex min-w-screen min-h-screen p-8 font-mono">
        <Dashboard session={session} />
      </div>
    );
  }
  return (
    <div className="flex min-w-screen min-h-screen p-8 font-mono">
      <SigninPage />
    </div>
  );
}
