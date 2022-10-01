import { Avatar, styled } from "@chakra-ui/react";
import { public_instructor } from "../../../lib/common/types";
import styles from "./InstructorCard.module.scss";
import { MdOutlineMailOutline } from "react-icons/md"
import { InstructorRatingBar } from "../../RatingBar";

interface InstructorCardProps {
    instructor: public_instructor
    authorized: boolean
}

function InstructorCard({ instructor, authorized }: InstructorCardProps) {
    const img_url = `https://directory.middlebury.edu/DirectoryImage.aspx?show=true&email=${instructor.email}`;
    const src = instructor.email && instructor.email !== "" ? img_url : undefined;

    const firstName = instructor.name.split(" ")[0];

    return (
        <div>
            <div className={styles.container}>
                <Avatar
                    name={instructor?.name}
                    src={src}
                    boxSize="120px"
                    bg="white"
                    className={styles.avatar}
                />
                <div className={styles.instructorText}>
                    <h1>{instructor?.name}</h1>
                    <p>{instructor?.departmentID}</p>
                    {(authorized) ? <span><MdOutlineMailOutline className={styles.emailIcon} />{" "}<a className={styles.emailText} href={`mailto://${instructor?.email}`}>Email {firstName}</a></span> : null}
                </div>

            </div>
            <InstructorRatingBar instructor={instructor} />
        </div>


    )
}


export default InstructorCard