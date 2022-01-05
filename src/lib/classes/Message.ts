
type Message_Object = {
   type: string;
   message: string;
};



export default class Message {
   type: string;
   message: string;

   constructor(type: string, message: string) {
      this.type = type;
      this.message = message;
   }

   public getObject(): Message_Object {
      return { type: this.type, message: this.message };
   }

}