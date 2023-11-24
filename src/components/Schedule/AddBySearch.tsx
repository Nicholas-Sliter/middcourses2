//                                    <AddCourseSectionsSelector
// course={course.course}
// catalogEntries={course.catalogEntries}
// onCourseAdded={onCourseAdded}
// schedule={schedule}

import { useState } from "react";
import AddCourseToScheduleItemProps from "./AddCourseToScheduleItemProps";
import { CatalogCourse, CatalogCourseWithInstructors, Maybe, public_course } from "../../lib/common/types";
import SearchBarAdvanced from "../common/SearchBoxAdvanced";
import useCatalogCourseEntries from "../../hooks/useCatalogCourseEntries";
import AddCourseSectionsSelector from "./AddCourseSectionsSelector";
import useCatalogCourse from "../../hooks/useCatalogCourse";


interface AddBySearchProps extends AddCourseToScheduleItemProps { };

function AddBySearch({
    schedule,
    onCourseAdded,
}: AddBySearchProps) {
    const semester = schedule.semester;
    const filters = {
        semesters: [semester],
    }
    const [selectedCourse, setSelectedCourse] = useState<Maybe<public_course>>(null);
    const { loading, catalogEntries } = useCatalogCourse(semester, selectedCourse?.courseID);
    let course: Maybe<{ course: public_course, catalogEntries: CatalogCourseWithInstructors[] }> = {
        course: selectedCourse,
        catalogEntries: catalogEntries,
    };

    const handleCourseSelected = (c: public_course) => {
        course = null;
        setSelectedCourse(c);
    };


    return (
        <div>
            <SearchBarAdvanced onCourseSelected={handleCourseSelected} filters={filters} showResultDropdown />
            {!loading && selectedCourse && course && <AddCourseSectionsSelector
                course={course.course}
                catalogEntries={course.catalogEntries}
                onCourseAdded={onCourseAdded}
                schedule={schedule}
            />}

        </div>
    );






}

export default AddBySearch;