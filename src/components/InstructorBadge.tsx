import { useEffect, useState } from "react";
import { public_instructor } from "../lib/common/types";
import styles from "../styles/components/InstructorBadge.module.scss";

//TODO: add a callback with an array of instrucotrIDs
// filter that array to add/remove the current id based on selected
export default function InstructorBadge({ id }) {
  const [instructor, setInstructor] = useState<public_instructor>(null);
  const [selected, setSelected] = useState(true);
  useEffect(() => {
    async function fetchInstructor() {
      const res = await fetch(`/api/instructor/id/${id}`);
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      setInstructor(data.instructor);
    }

    fetchInstructor();
  }, [id]);

  const badgeStyle = selected ? styles.badge + " " + styles.selected : styles.badge;

  return (
    <div key={id} className={styles.container}>
      {instructor ? (
        <>
          <button className={badgeStyle} onClick={()=>setSelected(!selected)}>
            {instructor.name}
          </button>
        </>
      ) : null}
    </div>
  );
}