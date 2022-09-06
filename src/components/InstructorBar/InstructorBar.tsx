import { public_instructor } from "../../lib/common/types";
import InstructorBadge from "../InstructorBadge";
import styles from "./InstructorBar.module.scss";

interface InstructorBarProps {
  instructors: public_instructor[];
  selected: string[];
  select: Function;
  deselect: Function;
  useTags?: boolean;
}

export default function InstructorBar({
  instructors,
  selected,
  select,
  deselect,
  useTags = false
}: InstructorBarProps) {
  return (
    <div className={(!useTags) ? styles.bar : styles.tagList}>
      {instructors.map((instructor) => (
        <InstructorBadge
          key={instructor.instructorID}
          instructor={instructor}
          selected={selected.includes(instructor.instructorID)}
          select={select}
          deselect={deselect}
        />
      ))}
    </div>
  );
}
