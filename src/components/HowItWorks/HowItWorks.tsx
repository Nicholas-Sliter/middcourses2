import { Center } from "@chakra-ui/react";
import { FaArrowAltCircleRight, FaBook, FaBuilding, FaUserGraduate } from "react-icons/fa";
import { RiNumber1, RiNumber2, RiNumber3 } from "react-icons/ri";
import Feature from "../common/Feature";
import FlexGroup from "../common/FlexGroup";
import Tile from "../Tile";
import styles from "./HowItWorks.module.scss";
import Image from "next/image";


function HowItWorks({ }) {


    return (
        <div className={styles.container}>
            <Center><h2>How it works</h2></Center>
            <FlexGroup>
                <Tile>
                    <Image src="/images/take-a-survey.svg" alt="1" width={390} height={260} />
                    <RiNumber1 className={styles.tileIcon} />
                    <h3 className={styles.title}>Review 2 Courses</h3>
                    <p className={styles.description}>
                        First, you&apos;ll write a review for 2 courses. This will grant you access to the rest of the site.
                    </p>

                </Tile>
                <Tile>
                    <Image src="/images/data-work.svg" alt="1" width={390} height={260} />
                    <RiNumber2 className={styles.tileIcon} />
                    <h3 className={styles.title}>Pick What&apos;s Right for You</h3>
                    <p className={styles.description}>
                        Using our entire catalog, compare courses, professors, and departments to find the best fit for you.
                    </p>

                </Tile>
                <Tile>
                    <Image src="/images/check-for-a-fit.svg" alt="1" width={390} height={260} />
                    <RiNumber3 className={styles.tileIcon} />
                    <h3 className={styles.title}>Discover Recommended Courses</h3>
                    <p className={styles.description}>
                        With the data you provide us, we&apos;ll recommend courses based on your interests and preferences.
                    </p>

                </Tile>



            </FlexGroup>




        </div >




    )



}


export default HowItWorks;