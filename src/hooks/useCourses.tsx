import { useState, useEffect } from "react";
import { public_course } from "../lib/common/types";

export default function useCourses(
    courseIds: string[]
) {
    const [courses, setCourses] = useState<public_course[]>([]);
    const [loading, setLoading] = useState(false);
    const courseIdsPrimitiveIdentifier = courseIds.sort().join(",");

    useEffect(() => {
        if (!courseIds || courseIds.length === 0) {
            setCourses([]);
        }

        const controller = new AbortController();

        async function fetchCourse(id) {
            const res = await fetch(`/api/course/${id}`, {
                signal: controller.signal
            });
            if (!res.ok) {
                return null;
            }
            const data = await res.json();
            return data.course;
        }

        setLoading(true);
        const promises = courseIds.map((id) => fetchCourse(id));
        Promise.all(promises).then((courses) => {
            setCourses(courses);
            setLoading(false);
        });

        return () => {
            controller.abort();
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseIdsPrimitiveIdentifier]);

    return { courses, loading };
}
