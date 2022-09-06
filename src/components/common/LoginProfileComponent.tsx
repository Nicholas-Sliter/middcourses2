import { useSession } from "next-auth/react";
import { CustomSession } from "../../lib/common/types";
import LoginButton from "./LoginButton";
import ProfileButton from "./ProfileButton";


export default function LoginProfileComponent() {
  const { data: session } = useSession() as { data: CustomSession };

  return (
    <>
      {session?.user ? <ProfileButton /> : <LoginButton header={true} />}

    </>
  );



}


