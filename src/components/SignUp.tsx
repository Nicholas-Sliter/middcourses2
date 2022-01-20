import TextInput from "./common/TextInput"
import { useState } from "react";

import styles from '../styles/components/SignUp.module.scss'


export default function SignUp() {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");

   return(
      <div className={styles.container}>
         <form>
            <TextInput label="Middlebury Email:" value={email} setValue={(e) => setEmail(e.value)} />
            <TextInput label="Password:" value={password} password setValue={(e) => setPassword(e.value)} />
            <TextInput label="Confirm Password:" value={confirmPassword} password setValue={(e) => setConfirmPassword(e.value)} />
            <button>Sign Up</button>
         </form>
      </div>

   );

}