/**
 * A floating squircle button that opens the interface to add a review.
 *
 */

import { Button, Portal, Tooltip } from "@chakra-ui/react";
import { RiAddBoxFill, RiEditFill } from "react-icons/ri";
import { useSession } from "next-auth/react";

import styles from "../../styles/components/common/AddButton.module.scss";
import { Schedule } from "../../lib/common/types";


interface EditScheduleButtonProps {
    onClick: () => void;
    schedule: Schedule;
    shouldRippleAnimate?: boolean; // Ripple animation to draw attention to the button
}


export default function EditScheduleButton({ onClick, schedule, shouldRippleAnimate }: EditScheduleButtonProps) {
    const { data: session, status } = useSession() as any;
    const isDisabled = !schedule;

    if (status === "loading") {
        return null;
    }

    if (session?.user?.role !== "student") {
        return null;
    }



    return (
        <Portal>
            <div className={styles.container}>
                <Tooltip label="Add or edit schedule" placement="top">
                    <Button
                        title="Add to schedule"
                        onClick={onClick}
                        disabled={isDisabled}
                    >
                        {/* <RiEditFill /> */}
                        <RiAddBoxFill />
                        <span className={styles.expandedText}>Add</span>
                    </Button>
                </Tooltip>
            </div>
        </Portal>
    );
}
