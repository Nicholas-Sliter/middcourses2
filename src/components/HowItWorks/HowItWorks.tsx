import { Center } from "@chakra-ui/react";
import { FaArrowAltCircleRight, FaBook, FaBuilding, FaUserGraduate } from "react-icons/fa";
import { RiNumber1, RiNumber2, RiNumber3 } from "react-icons/ri";
import Feature from "../common/Feature";
import FlexGroup from "../common/FlexGroup";
import Tile from "../Tile";
import styles from "./HowItWorks.module.scss";


function HowItWorks({ }) {


    return (
        <div className={styles.container}>
            <Center><h2>How it works</h2></Center>
            {/* <FlexGroup>
                <Feature> 
                    <FaBook />
                    <h3>Browse Courses</h3>
                    <p>
                        MiddCourses is Middlebury&apos;s premier course discovery and review platform.  Browse from our complete catalogue to discover the perfect course for you.
                    </p>
                </Feature>
                <Feature> 
                    <FaBuilding />
                    <h3>Discover Departments</h3>
                    <p>Find your perfect Major or Minor with ease. And within departments, discover top courses.</p>
                </Feature>
                <Feature> 
                    <FaUserGraduate />
                    <h3>Meet Professors</h3>
                    <p>
                        Find accommodating, knowledgeable, and enthusiastic instructors for your next course.  Your new favorite instructor is here.
                    </p>
                </Feature>
            </FlexGroup > */}

            <FlexGroup>
                <Tile>
                    <img src="/images/take-a-survey.svg" alt="1" width={390} height={260} />
                    <RiNumber1 className={styles.tileIcon} />
                    <h3 className={styles.title}>Review 2 Courses</h3>
                    <p className={styles.description}>
                        First, you&apos;ll write a review for 2 courses. This will grant you access to the rest of the site.
                    </p>

                </Tile>
                <Tile>
                    <img src="/images/data-work.svg" alt="1" width={390} height={260} />
                    <RiNumber2 className={styles.tileIcon} />
                    <h3 className={styles.title}>Pick What&apos;s Right for You</h3>
                    <p className={styles.description}>
                        Using our entire catalog, compare courses, professors, and departments to find the best fit for you.
                    </p>

                </Tile>
                <Tile>
                    <img src="/images/check-for-a-fit.svg" alt="1" width={390} height={260} />
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