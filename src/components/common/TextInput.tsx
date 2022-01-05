import { DEFAULT_VALIDATOR } from "../../lib/utils.ts";
import styles from '../../styles/components/common/TextInput.module.scss';

type TextInputProps = {
   value: string,
   setValue: (value: string) => void,
   label?: string,
   validator: Function,
   message?: string,
   type?: string,
   placeholder?: string,
   disabled?: boolean,
   required?: boolean

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
   required=false
}){



return(
   <>
      {(label) ? <label htmlFor={label}>{label}</label> : null}
      <input className={styles.textInput} type="text" placeholder={placeholder} value={value} onChange={(e) => setValue(e.target.value)} disabled={disabled} required={required}/>

   </>




);




}