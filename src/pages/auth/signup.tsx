import TextInput from "../../components/common/TextInput"
import { getGradYears } from "../../lib/frontend/utils";

export default function SignUpPage(){

   console.log(getGradYears());

   return (
      <div>
         <h1>Sign Up</h1>
         <TextInput label="Graduation Year" />
         <TextInput label="Major" />
      </div>
   );




}