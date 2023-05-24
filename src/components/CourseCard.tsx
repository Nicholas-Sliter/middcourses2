import { public_course } from "../lib/common/types";
import Link from "next/link";
import styles from "../styles/components/CourseCard.module.scss";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@chakra-ui/react";
import { BiChevronRight } from "react-icons/bi";
import ReadMore from "./common/ReadMore";
import { CourseRatingBar } from "./RatingBar";
import TagBar from "./TagBar";
import Bookmark from "./common/Bookmark";
import { useSession } from "next-auth/react";


interface CourseCardProps {
  course: public_course;
  style?: React.CSSProperties;
  isBookmarked?: boolean;
  showBookmark?: boolean;
  setBookmarked?: Function; //React.Dispatch<React.SetStateAction<boolean>>
}

export default function CourseCard({ course, style, isBookmarked = false, showBookmark = false, setBookmarked = () => { } }: CourseCardProps) {
  const department = course?.courseID.substring(0, 4);
  const courseNumber = course?.courseID.substring(4);

  const breadcrumbs = (
    <Breadcrumb spacing='8px' separator={<BiChevronRight />}>
      <BreadcrumbItem>
        <BreadcrumbLink as={Link} href={`/reviews/${department?.toLowerCase()}`}>{department}</BreadcrumbLink>
      </BreadcrumbItem>

      <BreadcrumbItem isCurrentPage>
        <BreadcrumbLink>{courseNumber}</BreadcrumbLink>
      </BreadcrumbItem>
    </Breadcrumb>
  );

  return (
    <div className={styles.container} style={style}>
      <div>
        <h1>{course?.courseName || <Skeleton />}</h1>
        {showBookmark && <Bookmark courseID={course?.courseID} isBookmarked={isBookmarked} setBookmarked={setBookmarked} />}
      </div>
      <span>{breadcrumbs}</span>
      {/* <Bookmark courseID={course?.courseID} isBookmarked={true} /> */}
      <CourseRatingBar course={course} />
      {/* <TagBar items={course?.topTags} customTagStyle={{ backgroundColor: "#fafafa", boxShadow: "1px 1px 10px 0px rgba(0, 0, 0, 0.12)" }} /> */}
      <ReadMore text={course?.courseDescription} maxLength={600} />
    </div>
  );
}
