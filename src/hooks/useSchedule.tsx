import { useEffect, useState } from "react";
import { CustomSession, public_course, Schedule } from "../lib/common/types";






async function fetchBookmarks(term: string, abortController: AbortController): Promise<public_course[]> {

    const res = await fetch(`/api/bookmarks?semester=${term}`, {
        method: "GET",
        credentials: "include",
        signal: abortController.signal,
    });

    if (!res.ok) {
        throw new Error("Failed to fetch bookmarks");
    }

    const data = await res.json();

    return data.bookmarks as public_course[];

}


async function fetchSchedules(term: string, abortController: AbortController): Promise<Schedule[]> {

    const res = await fetch(`/api/schedules/${term}`, {
        method: "GET",
        credentials: "include",
        signal: abortController.signal,
    });

    if (!res.ok) {
        throw new Error("Failed to fetch schedules");
    }

    const data = await res.json();

    return data.schedules as Schedule[];

}





function useSchedule(session: CustomSession, term: string) {

    const [bookmarks, setBookmarks] = useState<public_course[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);


    useEffect(() => {

        if (!session || !session.user) {
            return;
        }


        let abortController = new AbortController();

        const dataPromises = Promise.all([
            fetchBookmarks(term, abortController),
            fetchSchedules(term, abortController)
        ]);

        dataPromises.then((data) => {
            setBookmarks(data[0]);
            setSchedules(data[1]);
        })
            .catch((error) => {
                console.error(error);
            });


        return () => {
            abortController.abort();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user?.id, session?.user?.authorized, term]);


    return {
        bookmarks: bookmarks,
        schedules: schedules,
    };

}

export default useSchedule;