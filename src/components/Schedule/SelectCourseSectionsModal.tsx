import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import { CatalogCourse, CatalogCourseWithInstructors, Schedule, public_course } from "../../lib/common/types";
import AddCourseSectionsSelector from "./AddCourseSectionsSelector";
import styles from './SelectCourseSectionsModal.module.scss';
import useCatalogCourseEntries from "../../hooks/useCatalogCourseEntries";

interface SelectCourseSectionsProps {
    schedule: Schedule;
    course: public_course;
    // catalogEntries: CatalogCourseWithInstructors[];
    onCourseAdded: (coursesToDrop: CatalogCourse[], coursesToAdd: CatalogCourse[], schedule: Schedule) => void;
    isOpen: boolean;
    onClose: () => void;
};


function SelectCourseSectionsModal({
    schedule,
    course,
    // catalogEntries,
    onCourseAdded,
    isOpen,
    onClose
}: SelectCourseSectionsProps) {

    const idForQuery = (isOpen) ? course?.courseID : null;
    const { loading, catalogEntries } = useCatalogCourseEntries(schedule, idForQuery);

    if (!isOpen) {
        return null;
    }

    if (!schedule) {
        return null;
    }

    if (!course || !course.courseName) {
        return null;
    }



    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
        >
            <ModalOverlay />
            <ModalContent className={styles.modalContentContainer}>
                <ModalHeader>
                    <p>{course.courseName}</p>
                    < ModalCloseButton className />
                </ModalHeader>
                <ModalBody>
                    {(!loading) && <AddCourseSectionsSelector
                        course={course}
                        catalogEntries={catalogEntries}
                        onCourseAdded={onCourseAdded}
                        schedule={schedule}
                    />}
                </ModalBody>
            </ModalContent>
        </Modal>
    );



}

export default SelectCourseSectionsModal;