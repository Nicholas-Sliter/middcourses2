import { useSession } from "next-auth/react";
import { Session } from "../../lib/common/types";
import LoginButton from "./LoginButton";
import ProfileButton from "./ProfileButton";


export default function LoginProfileComponent() {
  const { data:session } = useSession() as {data: Session};

  return (
    <> 
    {session?.user ? <ProfileButton /> : <LoginButton header={true} />} 
    
    </>
  );



}


