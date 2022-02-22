
interface SelectProps {
  options: string[];
  selected: string;
  setSelected: (option: string) => void;
  title?: string;
  label?: string;
};

export default function Select({options, selected, setSelected, title="", label=""}: SelectProps) {
   return (
     <div>
       {label ? <label htmlFor={label}>{label}</label> : null}
       <select title={title} onChange={(e) => setSelected(e.target.value)} value={selected}>
         {options.map((option) => (
           <option key={option} value={option}>
             {option}
           </option>
         ))}
       </select>
     </div>
   );

}