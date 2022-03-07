/**
 * A floating squircle button that opens the interface to add a review.
 *
 */

import { Button, Portal } from "@chakra-ui/react";
import {RiAddFill} from "react-icons/ri";

import styles from "../../styles/components/common/AddButton.module.scss";

export default function AddButton({ onClick }) {
  return (
    <Portal>
    <div className={styles.container}>
      <Button
      title="Add a review"
        onClick={onClick}
      >
        <RiAddFill />
      </Button>
    </div>
    </Portal>
  );
}
