import TextInput from "../../components/common/TextInput"
import Select from "../../components/common/Select"
import { getGradYears } from "../../lib/frontend/utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { getSession } from "next-auth/react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function SignUpPage(){

   //TODO: switch to using react hook form
    const {
      register,
      handleSubmit,
      watch,
      formState: { errors },
    } = useForm();


      const [gradYr, setGradYr] = useState("");
      const [major, setMajor] = useState("");

   return (
      <div>
         <h1>Welcome {}</h1>
         <Select title="Graduation Year" options={getGradYears()} selected={gradYr} setSelected={setGradYr} label="Graduation Year"  />
      </div>
   );




}

//         <Select title="Major" />