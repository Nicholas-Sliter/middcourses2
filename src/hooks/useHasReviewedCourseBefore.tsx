import { useEffect, useState } from "react";
import { CustomSession, Maybe } from "../lib/common/types";


interface UseHasReviewedCourseBeforeResult {
    hasReviewed: Maybe<boolean>;
}


function useHasReviewedCourseBefore(session: CustomSession, courseID: string): UseHasReviewedCourseBeforeResult {

    const [hasReviewed, setHasReviewed] = useState<Maybe<boolean>>(null);
    const abortController = new AbortController();

    useEffect(() => {
        if (!session || !courseID) {
            setHasReviewed(null);
            return;
        };

        const fetchHasReviewed = async () => {
            const response = await fetch(`/api/profile/reviews?courseID=${courseID}`, {
                signal: abortController.signal,
            });
            const data = await response.json();

            if (data.error) {
                return;
            }

            setHasReviewed(data.exists);
        };

        fetchHasReviewed();

        return () => {
            abortController.abort();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user?.id, courseID, abortController]);

    return { hasReviewed };

}


export default useHasReviewedCourseBefore;
