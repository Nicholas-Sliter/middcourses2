import { Avatar, styled, StylesProvider, Tag } from "@chakra-ui/react";
import Link from "next/link";
import { public_instructor } from "../../lib/common/types";
import styles from "../../styles/components/common/Instructor.module.scss";

interface InstructorProps {
  instructor: public_instructor;
  link?: string
}

export default function Instructor({
  instructor,
  link = `/instructor/${instructor.slug}`,
}: InstructorProps) {
  const img_url = `https://directory.middlebury.edu/DirectoryImage.aspx?show=true&email=${instructor.email}`;

  const src = instructor.email && instructor.email !== "" ? img_url : null;


  return (
    <Link href={link} key={instructor.instructorID}>
      <Tag className={styles.container}>
          <Avatar
          name={instructor.name}
          src={null /*src*/}
          size="sm"
          mr={2}
          mb={2}
        />
        {instructor.name}
      </Tag>
    </Link>
  );
}
