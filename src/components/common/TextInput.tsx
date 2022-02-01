//import { DEFAULT_VALIDATOR } from "../../lib/utils.js";
import styles from '../../styles/components/common/TextInput.module.scss';

const DEFAULT_VALIDATOR = ()=>{};


type TextInputProps = {
   value: string,
   setValue: (value: string) => void,
   label?: string,
   validator: Function,
   message?: string,
   type?: string,
   placeholder?: string,
   disabled?: boolean,
   required?: boolean,
   password?: boolean,

};


export default function TextInput({
   value,
   setValue,
   label="",
   validator = DEFAULT_VALIDATOR,
   message="",
   type="",
   placeholder="",
   disabled=false,
   required=false,
   password=false
}){



return(
   <div className={styles.container}>
      {(label) ? <label htmlFor={label}>{label}</label> : null}
      <input className={styles.textInput} type={password ? "password" : "text"} placeholder={placeholder} value={value} onChange={(e) => setValue(e.target.value)} disabled={disabled} required={required}/>

   </div>




);




}