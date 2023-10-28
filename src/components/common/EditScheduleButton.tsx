/**
 * A floating squircle button that opens the interface to add a review.
 *
 */

import { Button, Portal, Tooltip } from "@chakra-ui/react";
import { RiEditFill } from "react-icons/ri";
import { useSession } from "next-auth/react";

import styles from "../../styles/components/common/AddButton.module.scss";
import { Schedule } from "../../lib/common/types";


interface EditScheduleButtonProps {
    onClick: () => void;
    schedule: Schedule;
}


export default function EditScheduleButton({ onClick, schedule }: EditScheduleButtonProps) {
    const { data: session, status } = useSession() as any;

    if (status === "loading") {
        return null;
    }

    if (session?.user?.role !== "student") {
        return null;
    }

    return (
        <Portal>
            <div className={styles.container}>
                <Tooltip label="Edit schedule" placement="top">
                    <Button
                        title="Edit schedule"
                        onClick={onClick}
                    >
                        <RiEditFill />
                        <span className={styles.expandedText}>Edit</span>
                    </Button>
                </Tooltip>
            </div>
        </Portal>
    );
}
