import TextInput from "../../components/common/TextInput";
import Select from "../../components/common/Select";
import { getGradYears } from "../../lib/frontend/utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSession, signIn, signOut } from "next-auth/react";
import Router from "next/router";
import { Session } from "../../lib/common/types";

export default function SignUpPage() {
  //TODO: switch to using react hook form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const { data: session } = useSession() as unknown as {data: Session};
  const [gradYr, setGradYr] = useState("");
  const [major, setMajor] = useState("");

  const fname = session?.user?.name?.split(" ")[0] ?? "";

  if (session?.user?.role === "faculty" ?? false) {
    //TODO: redirect to faculty dashboard
    Router.push("/");
  }


  return (

    <div>
      <h1>Welcome {fname}</h1>
      <p>Please complete the following information to continue</p>
      <Select
        title="Graduation Year"
        options={getGradYears()}
        selected={gradYr}
        setSelected={setGradYr}
        label="Graduation Year"
      />
      <Select
        title="Major"
        options={getGradYears()}
        selected={gradYr}
        setSelected={setGradYr}
        label="Major"
      />
    </div>
  );
}

//         <Select title="Major" />
