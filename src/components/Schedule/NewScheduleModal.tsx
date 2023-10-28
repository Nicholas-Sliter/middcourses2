import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, useToast, Select, FormLabel, Input } from "@chakra-ui/react";
import { Schedule } from "../../lib/common/types";
import styles from "./NewScheduleModal.module.scss";
import ScheduleAPI from "../../lib/interfaces/ScheduleAPI";
import Question from "../common/Question";
import { useForm } from "react-hook-form";

interface NewScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScheduleCreated: (schedule: Schedule) => void;
    semesterOptions: { label: string, value: string }[];
    defaultSemester: string;
};


function NewScheduleModal({
    isOpen,
    onClose,
    onScheduleCreated,
    semesterOptions,
    defaultSemester
}: NewScheduleModalProps) {

    const successToast = useToast({
        title: "Successfully created schedule",
        status: "success",
        duration: 5000,
        isClosable: true,
        id: "create-schedule-success",
    });

    const failedToCreateToast = useToast({
        title: "Failed to create schedule",
        status: "error",
        duration: 5000,
        isClosable: true,
        id: "failed-to-create-schedule",
    });

    const invalidNameToast = useToast({
        title: "Invalid schedule name",
        description: "Schedule name must be between 1 and 128 characters.",
        status: "error",
        duration: 5000,
        isClosable: true,
        id: "invalid-schedule-name",
    });

    const onSubmit = async (event) => {
        event.preventDefault();
        const schedule = {
            name: event.target.name.value,
            semester: event.target.semester.value,
        } as Omit<Schedule, "id">;

        if (!schedule.name || (schedule.name.length < 1) || (schedule.name.length > 128)) {
            if (invalidNameToast.isActive("invalid-schedule-name")) {
            }
            invalidNameToast();
            return;
        }

        // const promise = ScheduleAPI.createSchedule(schedule);

        const newSchedule = await ScheduleAPI.createSchedule(schedule);

        if (!newSchedule) {
            if (failedToCreateToast.isActive("failed-to-create-schedule")) {
                return;
            }
            failedToCreateToast();
            return;
        }

        onScheduleCreated(newSchedule);
        onClose();

        if (!successToast.isActive("create-schedule-success")) successToast();


        return;



        // if (!promise) {
        //     if (failedToCreateToast.isActive("failed-to-create-schedule")) {
        //         return;
        //     }
        //     failedToCreateToast();
        //     return;
        // }

        // promise.then((newSchedule) => {
        //     onScheduleCreated(newSchedule);
        //     onClose();
        //     return;
        // })
        //     .catch(() => {
        //         if (failedToCreateToast.isActive("failed-to-create-schedule")) {
        //             return;
        //         }
        //         failedToCreateToast();
        //     });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="md"
        >
            <ModalOverlay />
            <ModalContent className={styles.container}>
                <ModalHeader>
                    Create New Schedule
                    <ModalCloseButton className={styles.closeButton} />
                </ModalHeader>
                <ModalBody>
                    <form onSubmit={onSubmit}>
                        <Question label={undefined} htmlFor={undefined}>
                            <>
                                <FormLabel htmlFor="semester">Semester</FormLabel>
                                <Select
                                    className={styles.selectSemester}
                                    name="semester"
                                    id="semester"
                                    defaultValue={defaultSemester} >
                                    {semesterOptions?.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </Select>


                                <FormLabel htmlFor="name">Schedule Name</FormLabel>
                                <Input
                                    className={styles.inputName}
                                    name="name"
                                    id="name"
                                    placeholder="My Schedule"


                                />
                            </>
                        </Question>
                        <button
                            className={styles.submitButton}
                            // onClick={(data) => onSubmit(
                            //     { name: "test".substring(0, 128), semester: "F23" }
                            // )}
                            type='submit'
                        >
                            Create
                        </button>
                    </form>
                </ModalBody>
            </ModalContent>
        </Modal >

    );




}


export default NewScheduleModal;