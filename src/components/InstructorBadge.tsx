import { useEffect, useState } from "react";
import { public_instructor } from "../lib/common/types";
import styles from "../styles/components/InstructorBadge.module.scss";

interface InstructorBadgeProps {
  instructor: public_instructor;
  selected: boolean;
  select: Function;
  deselect: Function;
};

export default function InstructorBadge({ instructor, selected, select, deselect}: InstructorBadgeProps) {

  const badgeStyle = selected ? styles.badge + " " + styles.selected : styles.badge;
  const id = instructor.instructorID;

  return (
    <li key={id} className={styles.container}>
      {id ? (
        <>
          <button className={badgeStyle} 
          onClick={
            () => {(selected) ? deselect(id) : select(id)}}>
            {instructor.name}
          </button>
        </>
      ) : null}
    </li>
  );
}