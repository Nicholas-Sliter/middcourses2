import { Department } from "../../../lib/common/types";
import { MenuItem } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FaBuilding } from "react-icons/fa";
import Link from "next/link";

interface DepartmentSearchResult {
    compact?: boolean;
    department: Department;
}

export default function DepartmentSearchResult({
    department,
    compact = true,
}: DepartmentSearchResult) {

    const router = useRouter();

    return (
        <MenuItem
            key={department.departmentID}
            icon={<FaBuilding />}
            onClick={(e) => {
                e.preventDefault();
                router.push(`/reviews/${department.departmentID.toLowerCase()}`, undefined, { shallow: false });
            }}
            style={{ fontWeight: "bold" }}
        >
            <p>{department.departmentName} {" Department"}</p>
        </MenuItem>
    );
}
