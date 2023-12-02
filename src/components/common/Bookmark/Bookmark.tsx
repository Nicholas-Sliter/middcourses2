import { BsBookmark, BsBookmarkStar, BsBookmarkStarFill } from "react-icons/bs";
import styles from "./Bookmark.module.scss";
import { Tooltip } from "@chakra-ui/react";
import { setAnalyticsFlag } from "../../../lib/frontend/utils";

interface BookmarkProps {
    courseID: string;
    isBookmarked: boolean;
    setBookmarked?: Function; //React.Dispatch<React.SetStateAction<boolean>
}


async function bookmarkCourse(courseID: string, remove: boolean) {

    const res = await fetch(`/api/course/${courseID.toLowerCase()}/bookmark`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            remove: remove,
        }),

    });

    if (!res.ok) {
        console.error("Error bookmarking course");
        return;
    }

    const data = await res.json();

    return data;
}



function Bookmark({ courseID, isBookmarked, setBookmarked }: BookmarkProps) {

    const BookmarkIcon = isBookmarked ? BsBookmarkStarFill : BsBookmark

    const handleClick = async () => {
        const data = await bookmarkCourse(courseID, isBookmarked);
        setAnalyticsFlag('bookmark_clicked', 'true');
        if (setBookmarked) {
            // if (data.bookmarkAdded) {
            //     setBookmarked(true);
            // }
            // if (data.bookmarkRemoved) {
            //     setBookmarked(false);
            // }
            setBookmarked(data); // wrapped
        }
        return;
    };

    const filledClassName = isBookmarked ? styles.bookmark_filled : styles.bookmark_empty;

    return (
        <Tooltip label={isBookmarked ? "Remove bookmark" : "Bookmark course"} placement="bottom" >
            <button onClick={handleClick} className={styles.bookmark_container}>
                <BookmarkIcon className={filledClassName} />


            </button>
        </Tooltip>


    )

}


export default Bookmark;