import ErrorMessage from "./message/ErrorMessage";
import SuccessMessage from "./message/SuccessMessage";
import WarnMessage from "./message/WarnMessage";
import InfoMessage from "./message/InfoMessage";


type MessageProps = {
   type: string;
   message: string;
};


export default function Message({ type, message }: MessageProps) {
   
   const typeMapping = {
   'error': <ErrorMessage message={message}></ErrorMessage>,
   'success': <SuccessMessage message={message}></SuccessMessage>,
   'warning': <WarnMessage message={message}></WarnMessage>,
   'info': <InfoMessage message={message}></InfoMessage>
   };

   return typeMapping?.[type.toLowerCase()] ?? null;

}
