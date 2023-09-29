import { useState } from "react";
import { CatalogCourse, Schedule, public_course } from "../../lib/common/types";
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, useToast, Select, FormLabel, Input } from "@chakra-ui/react";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'


const AddByBookmark = () => null;
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
}
// const tabs: AddCourseTabs[] = ["bookmark", "search", "recommendation", "filter", "hasOpenings"];
const tabs: ITab[] = [
    {
        id: "bookmark",
        name: "Bookmark",
        content: <AddByBookmark />
    },
    {
        id: "search",
        name: "Search",
        content: <AddBySearch />
    },
    {
        id: "recommendation",
        name: "Recommendation",
        content: <AddByRecommendation />
    },
    {
        id: "filter",
        name: "Filter",
        content: <AddByFilter />
    },
    {
        id: "hasOpenings",
        name: "Has Openings",
        content: <AddByHasOpenings />
    },
];
// const tabFunctions: { [key in AddCourseTabs]: () => JSX.Element } = {
//     bookmark: AddByBookmark,
//     search: AddBySearch,
//     recommendation: AddByRecommendation,
//     filter: AddByFilter,
//     hasOpenings: AddByHasOpenings,
// };

const AddCourseTabs = () => {
    const [tab, setTab] = useState<AddCourseTabs>("bookmark");


    return (
        <Tabs tabIndex={tabs.findIndex((t) => t.id === tab)}>
            <TabList>
                {
                    tabs.map((tab) => (
                        // eslint-disable-next-line react/jsx-key
                        <Tab key={`${tab.id}-header`} onClick={() => setTab(tab.id)}>{tab.name}</Tab>
                    ))
                }
            </TabList>

            <TabPanels>
                {
                    tabs.map((tab) => (
                        // eslint-disable-next-line react/jsx-key
                        <TabPanel>
                            {tab.content}
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
    onCourseAdded: (course: CatalogCourse, schedule: Schedule) => void;
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


    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
        >
            <ModalOverlay />
            <ModalContent className>
                <ModalHeader>
                    ...
                    <ModalCloseButton className />
                </ModalHeader>
                <ModalBody>
                    <AddCourseTabs />
                </ModalBody>
            </ModalContent>
        </Modal>
    );




}


export default AddCourseToScheduleModal;