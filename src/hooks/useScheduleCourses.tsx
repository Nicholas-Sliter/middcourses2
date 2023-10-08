import { useEffect, useState, useRef } from "react";
import { CatalogCourse, public_course } from "../lib/common/types";

const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
};

function useScheduleCourses(planID: number | null, refresh: boolean = false, updateRefresh: (refresh: boolean) => void) {
    const previousPlanID = usePrevious(planID);
    const [scheduleCourses, setScheduleCourses] = useState<CatalogCourse[]>([]);
    const abortController = new AbortController();

    useEffect(() => {
        const fetchScheduleCourses = async () => {
            const res = await fetch(`/api/schedules/courses?planID=${planID}`, {
                signal: abortController.signal
            });
            const data = await res.json();
            setScheduleCourses(data ?? []);
        };

        if (!planID) {
            setScheduleCourses([]);
            return;
        }

        if (previousPlanID !== planID) {
            fetchScheduleCourses();
        }

        if (previousPlanID === planID && refresh) {
            fetchScheduleCourses().then(() => {
                updateRefresh(false);
            });
        }

        return () => {
            abortController.abort();
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [planID, refresh]);

    return scheduleCourses;
}

export default useScheduleCourses;
