import { useState } from "react";
import { CatalogCourse, CatalogCourseWithInstructors, Schedule, public_course } from "../../lib/common/types";
import { Radio, RadioGroup, Checkbox, CheckboxGroup, Stack, Alert, AlertIcon } from '@chakra-ui/react'
import { checkForTimeConflicts, toTitleCase } from "../../lib/common/utils";
import styles from "./AddCourseSectionsSelector.module.scss";
import { combind as combine } from "../../lib/frontend/utils";

interface AddCourseSectionsSelectorProps {
    course: public_course;
    catalogEntries: CatalogCourseWithInstructors[];
    onCourseAdded: (coursesToDrop: CatalogCourse[], coursesToAdd: CatalogCourse[], schedule: Schedule) => void;
    schedule: Schedule;
};


const minuteToTime = (minute: number) => {
    const hour = Math.floor(minute / 60);
    const minuteRemainder = minute % 60;
    const minuteString = minuteRemainder < 10 ? `0${minuteRemainder}` : minuteRemainder;
    const ampm = hour < 12 ? "am" : "pm";
    const hourString = hour % 12 === 0 ? "12" : hour % 12;
    return `${hourString}:${minuteString}${ampm}`;
}

const scheduleHasOverlapForSectionTimes = (schedule: Schedule, catalogEntry: CatalogCourse) => {
    if (!schedule.courses || !catalogEntry.times) {
        return false;
    }

    const times = catalogEntry.times;
    const scheduleTimes = schedule.courses.map((course) => {
        return course.times;
    });

    const mergedTimes = [times, ...scheduleTimes];

    const hasOverlap = checkForTimeConflicts(mergedTimes);

    return hasOverlap;
};

const getConflictingSections = (schedule: Schedule, catalogEntry: CatalogCourse) => {
    if (!schedule.courses || !catalogEntry.times) {
        return [];
    }


    const times = catalogEntry.times;


    const conflictingSections = schedule.courses
        .filter((course) => course.catalogCourseID !== catalogEntry.catalogCourseID)
        .filter((course) => checkForTimeConflicts([times, course.times]))
        .map((course) => course.catalogCourseID);

    return Array.from(new Set(conflictingSections));
}


const getCanUseEditButton = (schedule: Schedule, coursesToAdd: CatalogCourse[], coursesToDrop: CatalogCourse[]) => {
    const numberOfPrimarySections = schedule.courses.filter((course) => !course.isLinkedSection).length;
    const lessThanFivePrimarySections = numberOfPrimarySections < 5;

    const wouldHaveMoreThanFivePrimarySectionsAfterAction = (
        numberOfPrimarySections +
        coursesToAdd.filter(course => !course.isLinkedSection).length -
        coursesToDrop.filter(course => !course.isLinkedSection).length
    ) >= 6;

    return lessThanFivePrimarySections && !wouldHaveMoreThanFivePrimarySectionsAfterAction;
}


const SectionDisplay = (catalogEntry: CatalogCourseWithInstructors, isSelected: boolean, schedule: Schedule) => {
    if (!catalogEntry.times) {
        return null;
    }
    const weekdays = Object.values(catalogEntry.times).flat()?.reduce((acc, time) => {
        return [...acc, time.day]
    }, []);

    const uniqueDays = [...new Set(weekdays)];

    uniqueDays.sort((a, b) => {
        const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
        return days.indexOf(a) - days.indexOf(b);
    });

    const timeToDayMap = new Map<string, string[]>();
    Object.values(catalogEntry.times).flat().forEach((time) => {
        const day = time.day;
        const timeString = `${minuteToTime(time.start)}-${minuteToTime(time.end)}`;
        if (timeToDayMap.has(timeString)) {
            timeToDayMap.get(timeString)?.push(day);
        } else {
            timeToDayMap.set(timeString, [day]);
        }
    });

    const daysWithSameTimes = [...timeToDayMap.entries()].map(([time, days]) => {
        const daysString = toTitleCase(days.join(", "));
        return `${daysString}(${time})`;
    });

    const courseIdWithoutSemester = catalogEntry.catalogCourseID.split("-")[0];

    const cardClassName = combine([styles.courseSectionSelectorCard, ((isSelected) ? styles.courseSectionSelected : "")]);
    const instructorsString = (catalogEntry.instructors.length) ? `${catalogEntry.instructors.map((instructor => instructor.name)).join(", ")}` : "";

    const inSchedule = schedule.courses.filter((course) => course.catalogCourseID === catalogEntry.catalogCourseID).length > 0;


    const InSchedule = () => {
        return (
            <div data-selected={isSelected} className={styles.inSchedule}>
                <span>In Schedule</span>
            </div>
        );
    }

    return (
        <div className={cardClassName}>
            <header>
                <h3>{courseIdWithoutSemester}</h3>
                {/* <p>{"with "}</p> */}
                <span>{instructorsString}</span>
                {/* <span>{getCourseTypeFull(catalogEntry)}</span> */}
                {(inSchedule) ? <InSchedule /> : null}
            </header>
            <div className={styles.content}>
                {/* <p>{instructorsString}</p> */}
                {/* <p>{uniqueDays}</p> */}
                {daysWithSameTimes.map((line) =>
                    <p
                        key={line}
                        className={styles.timesString}
                    >
                        {line}
                    </p>)}
            </div>
        </div>
    );
};


interface SectionDisplay {
    catalogEntry: CatalogCourse;
    hasOverlap: boolean;
    overlappingSections: string[];
}


const getSectionsData = (schedule: Schedule, catalogEntries: CatalogCourse[]): SectionDisplay[] => {
    const sectionsData: SectionDisplay[] = catalogEntries.map((catalogEntry) => {
        const hasOverlap = scheduleHasOverlapForSectionTimes(schedule, catalogEntry);
        const conflictingSections = (hasOverlap) ? getConflictingSections(schedule, catalogEntry) : [];

        return {
            catalogEntry,
            hasOverlap,
            overlappingSections: conflictingSections
        };
    });

    return sectionsData;
}



function AddCourseSectionsSelector({
    course,
    catalogEntries,
    onCourseAdded,
    schedule
}: AddCourseSectionsSelectorProps) {


    /* Schedule may already have a section for this course */
    const defaultSection = schedule.courses
        .find((scheduleCourse) => course.courseID === scheduleCourse.courseID && !scheduleCourse.isLinkedSection)
        ?.catalogCourseID;


    /* Schedule may already have a subsection for this course */
    const defaultSubSection = schedule.courses
        .find((scheduleCourse) => course.courseID === scheduleCourse.courseID && scheduleCourse.isLinkedSection)
        ?.catalogCourseID;

    const getCatalogEntryById = (catalogCourseID: string) => {
        return catalogEntries.find((catalogEntry) => {
            return catalogEntry.catalogCourseID === catalogCourseID;
        });
    }

    const [selectedSections, setSelectedSections] = useState<CatalogCourseWithInstructors>(getCatalogEntryById(defaultSection));
    const [selectedSubsections, setSelectedSubsections] = useState<CatalogCourseWithInstructors>(getCatalogEntryById(defaultSubSection));


    const subsections = catalogEntries.filter((catalogEntry) => {
        return catalogEntry.isLinkedSection;
    });
    const sections = catalogEntries.filter((catalogEntry) => {
        return !catalogEntry.isLinkedSection;
    });



    const data: SectionDisplay[] = getSectionsData(schedule, catalogEntries);
    const sectionData = data.filter((data) => !data.catalogEntry.isLinkedSection);
    const subsectionsData = data.filter((data) => data.catalogEntry.isLinkedSection);

    const sectionsToDrop = Object.values(schedule.courses).flat().filter((scheduleCourse) => {
        return course.courseID === scheduleCourse.courseID && !scheduleCourse.isLinkedSection && scheduleCourse.catalogCourseID !== selectedSections?.catalogCourseID;
    });

    const subSectionsToDrop = Object.values(schedule.courses).flat().filter((scheduleCourse) => {
        return course.courseID === scheduleCourse.courseID && scheduleCourse.isLinkedSection && scheduleCourse.catalogCourseID !== selectedSubsections?.catalogCourseID;
    });

    let sectionsToDropString = "";
    if (sectionsToDrop.length || subSectionsToDrop.length) {
        sectionsToDropString = "Remove ".concat([...sectionsToDrop, ...subSectionsToDrop]
            .filter(course => !!course)
            .map((course) => {
                if (!course) {
                    return "";
                }
                return course.catalogCourseID;
            })
            .map((courseId) => courseId.split("-")[0])
            .join(", "));

    }


    let sectionsToAddString = "";
    const coursesToAdd = [selectedSections, selectedSubsections]
        .filter(course => course !== null)
        .filter((course) => ![defaultSection, defaultSubSection].includes(course?.catalogCourseID))
    if (selectedSections && coursesToAdd.length) {
        sectionsToAddString = "Add ".concat(coursesToAdd
            .map((course) => course.catalogCourseID)
            .map((courseId) => courseId.split("-")[0])
            .join(", "));
    }



    // const selectedCoursesDisplay = selectedCoursesStrings.map(string => string.split("-")[0]).join(", ") ?? 'sections';

    let modifyButtonText = "";
    if (sectionsToDropString) {
        modifyButtonText = sectionsToDropString;

        if (sectionsToAddString) {
            modifyButtonText += ', ';
        }
    }
    if (sectionsToAddString) {
        modifyButtonText += sectionsToAddString;
    }



    let changeMade = true;
    if (!modifyButtonText) {
        changeMade = false;
        modifyButtonText = "No changes made";
    }


    const numberOfPrimarySections = schedule.courses.filter((course) => !course.isLinkedSection).length;
    const lessThanFivePrimarySections = numberOfPrimarySections < 5;

    const wouldHaveMoreThanFivePrimarySectionsAfterAction = (
        numberOfPrimarySections +
        coursesToAdd.filter(course => !course.isLinkedSection).length -
        sectionsToDrop.filter(course => !course.isLinkedSection).length
    ) >= 6;

    if (changeMade && wouldHaveMoreThanFivePrimarySectionsAfterAction) {
        modifyButtonText = "Schedule is full";
    }

    /* Handle ensuring both a section and subsection are selected (if present) */
    const hasSelectedSection = !!selectedSections;
    const alreadyHasSection = !!defaultSection;
    const hasValidSection = hasSelectedSection || alreadyHasSection;

    const hasSelectedSubSection = !!selectedSubsections;
    const courseHasSubSections = subsections.length > 0;
    const alreadyHasSubSection = (!!defaultSubSection) && selectedSubsections?.catalogCourseID === defaultSubSection;
    const hasValidSubSection = !(courseHasSubSections) || (hasSelectedSubSection || alreadyHasSubSection);

    const hasValidSelections = changeMade && hasValidSection && hasValidSubSection && !wouldHaveMoreThanFivePrimarySectionsAfterAction;

    const isAddSectionButtonDisabled = !hasValidSelections;

    if (!sections) {
        return null;
    }


    return (<div>
        <>
            {/* <p>Main Section</p> */}
            <RadioGroup
                name='sections'
                onChange={(value) => setSelectedSections(getCatalogEntryById(value))}
                value={selectedSections?.catalogCourseID}
                className={styles.sectionRadioGroup}
            >
                <Stack>
                    {sectionData.map((data) => {
                        const { catalogEntry, hasOverlap, overlappingSections } = data;
                        const isDisabled = hasOverlap && catalogEntry.catalogCourseID !== defaultSection;
                        const conflictingSectionsString = `Conflicts with ${overlappingSections.map((id) => id?.split("-")?.[0])?.join(", ")}`;
                        const isSelected = selectedSections?.catalogCourseID === catalogEntry.catalogCourseID;
                        return (
                            <>
                                <Radio isDisabled={isDisabled} key={catalogEntry.catalogCourseID} value={catalogEntry.catalogCourseID}> {SectionDisplay(catalogEntry, isSelected, schedule)}</Radio>
                                {(isDisabled) ? <Alert className={styles.conflictWarning} status="warning"> <AlertIcon /> {conflictingSectionsString}</Alert> : null}
                            </>
                        );
                    })}
                </Stack>
            </RadioGroup>
        </>
        {
            !!subsections.length && <>
                <hr className={styles.linkedSectionSeparator} />
                < RadioGroup
                    name='subsections'
                    onChange={(value) => setSelectedSubsections(getCatalogEntryById(value))}
                    value={selectedSubsections?.catalogCourseID}
                    className={styles.sectionRadioGroup}
                >
                    <Stack>
                        {subsectionsData.map((data) => {
                            const { catalogEntry, hasOverlap, overlappingSections } = data;
                            const isDisabled = hasOverlap && catalogEntry.catalogCourseID !== defaultSubSection;
                            const conflictingSectionsString = `Conflicts with ${overlappingSections.map((id) => id?.split("-")?.[0])?.join(", ")}`;

                            const isSelected = selectedSubsections?.catalogCourseID === catalogEntry.catalogCourseID;

                            return (
                                <>
                                    <Radio isDisabled={isDisabled} key={catalogEntry.catalogCourseID} value={catalogEntry.catalogCourseID}> {SectionDisplay(catalogEntry, isSelected, schedule)}</Radio>
                                    {(isDisabled) ? <Alert className={styles.conflictWarning} status="warning"> <AlertIcon /> {conflictingSectionsString}</Alert> : null}
                                </>
                            );
                        })}
                    </Stack >
                </RadioGroup>
            </>
        }


        <button
            disabled={isAddSectionButtonDisabled}
            aria-disabled={isAddSectionButtonDisabled}
            className={styles.addCoursesButton}
            onClick={(event) => {
                event.preventDefault();
                onCourseAdded([...sectionsToDrop, ...subSectionsToDrop], coursesToAdd, schedule);
            }}
        >
            {modifyButtonText}</button>

    </div >
    );

}


export default AddCourseSectionsSelector;