import { useEffect, useState } from "react";
import { CatalogCourseWithInstructors, Schedule, } from "../lib/common/types";

function useCatalogCourse(semester: string, courseID: string | null) {
    const [loading, setLoading] = useState(false);
    const [scheduleCourses, setScheduleCourses] = useState<CatalogCourseWithInstructors[]>([]);
    const abortController = new AbortController();

    useEffect(() => {
        const fetchScheduleCourses = async () => {
            setLoading(true);
            const res = await fetch(`/api/course/${courseID}/catalog/entry?semester=${semester}`, {
                signal: abortController.signal
            });
            const data = await res.json();
            setScheduleCourses(() => {
                setLoading(false);
                return data ?? [];
            });
        };

        if (!courseID || !semester) {
            setScheduleCourses(() => {
                setLoading(false);
                return [];
            });
            return;
        }

        fetchScheduleCourses();

        return () => {
            abortController.abort();
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseID, semester]);

    return { loading, catalogEntries: scheduleCourses };
}

export default useCatalogCourse;
