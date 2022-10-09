import { Textarea } from "@chakra-ui/react";
import CharacterCount from "./CharacterCount";

export default function ReviewContentInput({ onChange, value, className }) {


  //  const descriptionText = "Briefly describe your experience in this course and highlight things that might be helpful for perspective students. This review will be visible to other students and will help them make informed decisions about their courses. Please be respectful and do not include any personal information.";
  //All reviews are anonymous, please be respectful and do not include any personal information.
  const descriptionText = "Briefly describe your experience in this course and highlight things that might be helpful for prospective students";


  return (
    <>
      <Textarea
        resize="none"
        value={value}
        placeholder={descriptionText}
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
