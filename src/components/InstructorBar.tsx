import { public_instructor } from "../lib/common/types";
import InstructorBadge from "./InstructorBadge";
import styles from "../styles/components/InstructorBar.module.scss";

interface InstructorBarProps {
  instructors: public_instructor[];
  selected: string[];
  select: Function;
  deselect: Function;
}

export default function InstructorBar({
  instructors,
  selected,
  select,
  deselect,
}: InstructorBarProps) {
  return (
    <div className={styles.bar}>
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
