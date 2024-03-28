import { useState } from "react";
import AddCourseToScheduleItemProps from "./AddCourseToScheduleItemProps";
import { Maybe, public_course } from "../../lib/common/types";
import SearchBarAdvanced from "../common/SearchBoxAdvanced";
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

    const handleCourseSelected = (c: public_course) => {
        setSelectedCourse(c);
    };


    return (
        <div>
            <SearchBarAdvanced onCourseSelected={handleCourseSelected} filters={filters} showResultDropdown />
            {!loading && selectedCourse && catalogEntries && <AddCourseSectionsSelector
                course={selectedCourse}
                catalogEntries={catalogEntries}
                onCourseAdded={onCourseAdded}
                schedule={schedule}
            />}

        </div>
    );






}

export default AddBySearch;