import { useEffect, useState } from "react";
import { CatalogCourse, public_course } from "../lib/common/types";


function useBookmarkedCourses(semester: string) {
    const [bookmarks, setBookmarks] = useState<Record<string, { course: public_course, catalogEntries: CatalogCourse[] }>>({});
    const abortController = new AbortController();

    useEffect(() => {
        const fetchBookmarks = async () => {
            const res = await fetch(`/api/bookmarks/courses?semester=${semester}`, {
                signal: abortController.signal
            });
            const data = await res.json();
            setBookmarks(data?.bookmarks ?? {});
        };

        fetchBookmarks();


        return () => {
            abortController.abort();
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [semester, setBookmarks]);

    return bookmarks;
}

export default useBookmarkedCourses;