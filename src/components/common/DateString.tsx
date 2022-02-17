import { relativeTimeFromDates } from "../../lib/frontend/utils";
import styles from "../../styles/components/common/DateString.module.scss";

interface DateProps {
   date: string;
   relative?: boolean;
   titlePrefix?: string;
};


export default function DateString({date, relative=true, titlePrefix=""}: DateProps) {

   const D = new Date(date);
   const time = relative ? relativeTimeFromDates(D) : D.toLocaleString();

   return (
     <>
       <span title={`${titlePrefix} ${D.toLocaleString()}`} className={styles.timeString}>{time}</span>
     </>
   );




}