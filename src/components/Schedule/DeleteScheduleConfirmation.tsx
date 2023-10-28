import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Button,
    Textarea,
    Select,
    useToast,
} from "@chakra-ui/react";
import { Schedule } from "../../lib/common/types";
import ScheduleAPI from "../../lib/interfaces/ScheduleAPI";
import styles from './DeleteScheduleConfirmation.module.scss';
import { useRef } from "react";


interface DeleteScheduleConfirmationProps {
    schedule: Schedule;
    isOpen: boolean;
    onClose: () => void;
    onDeleted: () => void;
}

function DeleteScheduleConfirmation({ schedule, isOpen, onClose, onDeleted }: DeleteScheduleConfirmationProps) {

    const cancelRef = useRef();

    const toast = useToast();

    const successToast = () => {
        toast({
            title: `Successfully deleted schedule ${schedule.name}.`,
            status: "success",
            duration: 5000,
            isClosable: true,
            id: "delete-schedule-success",
        });
    }

    const errorToast = () => {
        toast({
            title: `Error deleting schedule ${schedule.name}.`,
            status: "error",
            duration: 5000,
            isClosable: true,
            id: "delete-schedule-error",
        });
    }


    const onSubmit = async () => {
        const success = await ScheduleAPI.deleteSchedule(schedule);
        if (success) {
            successToast();
            onClose();
            onDeleted();
        } else {
            errorToast();
        }
    }

    if (!schedule) return null;

    return (
        <AlertDialog
            isOpen={isOpen}
            onClose={onClose}
            isCentered
            leastDestructiveRef={cancelRef}
        >
            <AlertDialogOverlay className={styles.container}>
                <AlertDialogContent className={styles.content}>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Delete Schedule: <i>{schedule.name}</i>?
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        Are you sure? You cannot undo this action.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={onSubmit} ml={3}>
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog >
    );


}

export default DeleteScheduleConfirmation;