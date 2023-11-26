/**
 * A floating squircle button that opens the interface to add a review.
 *
 */

import { Button, Portal, Tooltip } from "@chakra-ui/react";
import { RiEditFill } from "react-icons/ri";
import { useSession } from "next-auth/react";
import { useToast } from "@chakra-ui/react";

import styles from "../../styles/components/common/AddButton.module.scss";

interface AddButtonProps {
  onClick: () => void;
  disabled?: boolean;
  disabledTooltip?: string;
}


export default function AddButton({ onClick, disabled, disabledTooltip }: AddButtonProps) {
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

  if (session?.user?.role !== "student") {
    return null;
  }

  //if unathenticated, button shows toast message
  onClick = status === "unauthenticated" ? signInToast : onClick;

  const tooltip = disabledTooltip ? disabledTooltip : "Write a review";


  return (
    <Portal>
      <Tooltip label={tooltip} placement="left">
        <div className={styles.container}>
          <Tooltip label={tooltip} placement="top">
            <Button
              // title="Add a review"
              onClick={onClick}
              disabled={disabled}
            >
              <RiEditFill />
              <span className={styles.expandedText}>Review</span>
            </Button>
          </Tooltip>
        </div>
      </Tooltip>
    </Portal>
  );
}
