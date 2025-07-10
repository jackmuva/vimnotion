import { Session } from "next-auth";
import { SignOut } from "./ui/sign-out";

export const Dashboard = ({ session }: { session: Session }) => {

  return (
    <div className="flex w-full h-full">
      <SignOut />
    </div>
  );
}
