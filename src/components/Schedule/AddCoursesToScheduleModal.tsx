import { useState } from "react";
import { CatalogCourse, Schedule, public_course } from "../../lib/common/types";
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, useToast, Select, FormLabel, Input } from "@chakra-ui/react";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import styles from "./AddCoursesToScheduleModal.module.scss";
import AddCourseToScheduleItemProps from "./AddCourseToScheduleItemProps";
import React from "react";
import AddByBookmark from "./AddByBookmark";


// const AddByBookmark = () => null;
const AddBySearch = () => null;
// const AddBySubject = () => null;
const AddByRecommendation = () => null;
const AddByFilter = () => null;
const AddByHasOpenings = () => null;



type AddCourseTabs = "bookmark" | "search" | "recommendation" | "filter" | "hasOpenings";
interface ITab {
    id: AddCourseTabs;
    name: string;
    content: JSX.Element;
    hidden?: boolean;
}
const tabs: ITab[] = [
    {
        id: "bookmark",
        name: "Bookmarks",
        //@ts-ignore 
        content: <AddByBookmark />
    },
    {
        id: "search",
        name: "Search",
        //@ts-ignore 
        content: <AddBySearch />,
        hidden: true
    },
    {
        id: "recommendation",
        name: "Recommendations",
        //@ts-ignore 
        content: <AddByRecommendation />,
        hidden: true
    },
    {
        id: "filter",
        name: "Filter",
        //@ts-ignore 
        content: <AddByFilter />,
        hidden: true
    },
    {
        id: "hasOpenings",
        name: "Has Openings",
        //@ts-ignore 
        content: <AddByHasOpenings />,
        hidden: true
    },
];

const INITIAL_TAB = "bookmark";

const AddCourseTabs = ({ schedule, onCourseAdded }: AddCourseToScheduleItemProps) => {
    const [tab, setTab] = useState<AddCourseTabs>(INITIAL_TAB);
    const visibleTabs = tabs.filter((t) => !(t?.hidden ?? false));

    return (
        <Tabs
            isLazy
            tabIndex={visibleTabs.findIndex((t) => t.id === tab)}
            className={styles.tabBarContainer}
        >
            <TabList>
                {
                    visibleTabs.map((tab) => (
                        <Tab key={`${tab.id}-header`} onClick={() => setTab(tab.id)}>{tab.name}</Tab>
                    ))
                }
            </TabList>

            <TabPanels>
                {
                    visibleTabs.map((tab) => (
                        <TabPanel key={tab.id}>
                            {React.cloneElement(tab.content, { schedule, onCourseAdded })}
                        </TabPanel>
                    ))
                }

            </TabPanels>
        </Tabs>
    );
}




interface AddCourseToScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCourseAdded: (coursesToDrop: CatalogCourse[], coursesToAdd: CatalogCourse[], schedule: Schedule) => void;
    schedule: Schedule;
};


function AddCourseToScheduleModal({
    isOpen,
    onClose,
    onCourseAdded,
    schedule
}: AddCourseToScheduleModalProps) {


    if (!isOpen) {
        return null;
    }

    if (!schedule) {
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
                    {`Add to Schedule: `}<span>{schedule.name}</span>
                    < ModalCloseButton />
                </ModalHeader>
                <ModalBody>
                    <AddCourseTabs schedule={schedule} onCourseAdded={onCourseAdded} />
                </ModalBody>
            </ModalContent>
        </Modal>
    );




}


export default AddCourseToScheduleModal;