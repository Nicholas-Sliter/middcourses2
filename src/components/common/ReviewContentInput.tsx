import { Textarea } from "@chakra-ui/react";
import CharacterCount from "./CharacterCount";
import { useState } from "react";


export default function ReviewContentInput({ onChange, value, className }) {


  return (
    <>
      <Textarea
        resize="none"
        value = {value}
        placeholder="Enter your review here ..."
        onChange={e => onChange(e.target.value)}
      ></Textarea>
      <CharacterCount
        className={className}
        min={200}
        max={2048}
        count={value?.length ?? 0}
      />
    </>
  );
}
