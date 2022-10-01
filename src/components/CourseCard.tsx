import { public_course } from "../lib/common/types";
import Link from "next/link";
import styles from "../styles/components/CourseCard.module.scss";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@chakra-ui/react";
import { BiChevronRight } from "react-icons/bi";
import ReadMore from "./common/ReadMore";
import RatingBar, { CourseRatingBar } from "./RatingBar";
import TagBar from "./TagBar";


interface CourseCardProps {
  course: public_course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const department = course?.courseID.substring(0, 4);
  const courseNumber = course?.courseID.substring(4);

  const breadcrumbs = <Breadcrumb spacing='8px' separator={<BiChevronRight />}>
    <BreadcrumbItem>
      <BreadcrumbLink href={`/reviews/${department?.toLowerCase()}`}>{department}</BreadcrumbLink>
    </BreadcrumbItem>

    <BreadcrumbItem isCurrentPage>
      <BreadcrumbLink>{courseNumber}</BreadcrumbLink>
    </BreadcrumbItem>
  </Breadcrumb>

  return (
    <div className={styles.container}>
      <h1>{course?.courseName || <Skeleton />}</h1>
      <span>{breadcrumbs}</span>
      <CourseRatingBar course={course} />
      {/* <TagBar items={course?.topTags} /> */}
      <ReadMore text={course?.courseDescription} maxLength={600} />
    </div>
  );
}
