import { public_instructor } from "../../../lib/common/types";
import { MenuItem } from "@chakra-ui/react";
import { useRouter } from "next/router";

interface CourseSearchResultProps {
  compact?: boolean;
  instructor: public_instructor;
}

export default function InstructorSearchResult({
  instructor,
  compact = true,
}: CourseSearchResultProps) {

  const router = useRouter();

  return (
    <MenuItem
      key={instructor.slug}
      onClick={(e) => {
        e.preventDefault();
        router.push(`/instructor/${instructor.slug}`, undefined, { shallow: false });
      }}
    >
      {instructor.name}
    </MenuItem>
  );
}
