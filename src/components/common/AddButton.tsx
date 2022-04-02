/**
 * A floating squircle button that opens the interface to add a review.
 *
 */

import { Button, Portal } from "@chakra-ui/react";
import {RiAddFill} from "react-icons/ri";
import { useSession } from "next-auth/react";
import { useToast } from "@chakra-ui/react";

import styles from "../../styles/components/common/AddButton.module.scss";

export default function AddButton({ onClick }) {
  const { data: session, status } = useSession() as any;
  const toast = useToast();

  const signInToast = () => {
    toast({
          title: 'Login to create a review',
          description: "You must be logged in to create a review",
          status: 'error',
          duration: 5000,
          isClosable: true,

        })
  };
  
  if (status === "loading") {
    return null;
  } 

  if (session?.user?.role === "faculty") {
    return null;
  }

  //if unathenticated, button shows toast message
  onClick = status === "unauthenticated" ? signInToast : onClick;

  return (
    <Portal>
    <div className={styles.container}>
      <Button
      title="Add a review"
        onClick={onClick}
      >
        <span className={styles.expandedText}>Review</span>
        <RiAddFill />
      </Button>
    </div>
    </Portal>
  );
}
