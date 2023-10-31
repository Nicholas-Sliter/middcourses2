import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Alert, AlertDescription, AlertIcon, AlertTitle, EditablePreview, Spacer, Text } from "@chakra-ui/react";
import PageTitle from "../../components/common/PageTitle"
import CustomAccordion from "../../components/Accordion";
import ReviewCard from "../../components/Review/NewReview";
import { public_review } from "../../lib/common/types";
import Link from "next/link";


type Faq = {
    title: string,
    contents: React.ReactNode,
    name?: string,
    group?: string,
}


const FaqContentWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <div style={{
            padding: '1rem',
            border: '1px solid #ccc',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            lineHeight: '1.5rem',
        }}>
            {children}
        </div>
    );

};


const fakeFlagReview: public_review = {
    reviewID: "1",
    courseID: "FAKE0101",
    instructorID: "1",
    semester: "F23",
    reviewDate: '2022-10-20T00:00:00.000Z',
    rating: 10,

    difficulty: 10,
    value: 10,
    hours: 5,

    again: true,
    primaryComponent: "",


    tags: [], instructorEffectiveness: 8, instructorAccommodationLevel: 8, instructorEnthusiasm: 8,
    instructorAgain: true, instructorEnjoyed: true,


    content: "This is a fake review to showcase the flag review button. Click the flag icon to try out flagging a review.",



};


const faqs: Faq[] = [
    {
        title: "What is midd.courses?",
        group: "Main",
        name: "about",
        contents: (
            <FaqContentWrapper>
                <p>
                    MiddCourses is an online course review, discovery, and planning tool for Middlebury College students. It is a project of MiddDev, a student organization that aims to build and maintain software that improves the Middlebury experience. This iteration of MiddCourses is a complete rewrite of the original, which was built in 2014 and stopped functioning in 2020.
                </p>
                <p>
                    We launched in Fall 2022 and has since amassed over 3,000 course reviews.
                </p>
                <p>
                    MiddCourses allows students to discover courses, instructors, and departments. Courses are ranked based on aggregate analysis of course reviews. Instructors and departments are ranked based on the average rating of their courses. Students can also view personalized recommendations for courses based on their previous course reviews.
                </p>
                <p>
                    Each semester, students can submit anonymous reviews of their courses. A review combines ratings of the course and the instructor, as well as a written, holistic review. Writing 2 reviews per semester (calculated as 2 reviews in the last 6 months) is required for a student to be able to view other reviews. This incentivizes students to write reviews. 100-level & FYSE courses are excluded from this requirement and their reviews are visible without any authentication. This allows new students to still use MiddCourses.
                </p>
                <p>
                    MiddCourses also includes a Schedule Planner, which allows students to plan their schedules for future semesters. Students can add courses to their schedule and view their schedule in a calendar and list format. Students can easily add bookmarked courses to their schedule.
                </p>
            </FaqContentWrapper>
        )
    },
    {
        title: "Are my reviews anonymous?",
        group: "Reviews",
        name: "anonymous",
        contents: (
            <FaqContentWrapper>
                <p>
                    Yes, all reviews are anonymous. Your name will not be displayed on the website. Neither instructors nor other students will be able to see who wrote a review.
                    Keep in mind that the information you share within a review may be used to identify you. We recommend that you do not share any information that could uniquely identify you.

                </p>
                <Alert status="warning" style={{ boxSizing: 'border-box', borderRadius: '0.5rem' }}>
                    <AlertIcon />
                    <AlertDescription>
                        In extreme cases, such as threats of violence, we may be required to share your information with relevant authorities. Please do not use MiddCourses to make threats of violence.
                    </AlertDescription>
                </Alert>
            </FaqContentWrapper>
        )
    },
    {
        title: "How do I submit a review?",
        group: "Reviews",
        name: "how-to-submit",
        contents: (
            <FaqContentWrapper>
                <p>
                    You can submit a review by searching for a course you have taken and clicking the Review button. You must be logged in to submit a review.
                </p>
            </FaqContentWrapper>
        )
    },
    {
        title: "Who can submit a review?",
        group: "Reviews",
        name: "who-can-submit",
        contents: (
            <FaqContentWrapper>
                <p>
                    Any Middlebury student can submit a review for a course they have taken. Course reviews open up after about two-thirds of the semester has passed, this is before the registration period for the next semester.
                </p>
            </FaqContentWrapper>
        )
    },
    {
        title: "I am a new first-year student and I want to see reviews to plan my first semester. Can I submit a review?",
        group: "Main",
        name: "first-year",
        contents: (
            <FaqContentWrapper>
                <p>
                    No, you must have completed at least 2/3 of a course to submit a review. Since you have not yet completed any courses, you cannot submit a review.
                </p>

                {/* However, we have a <a href="https://middcourses.com/firstyear">First-Year Guide</a> that can help you plan your first semester. */}

                <p>
                    However, we have made some accommodations for first-year students. You can view reviews for 100-level courses, as well as see the last 3 reviews of any instructor.
                    We also publish course rankings which you can view <Link href="browse/courses" passHref><a>here</a></Link>.
                    This should help you plan your first semester. After two-thirds of the semester has passed, you will be able to submit 2+ reviews and use the full site to plan for future semesters.
                </p>
                <p>
                    By logging in with your Middlebury account, you can
                </p>
                <ul>
                    <li>Bookmark courses</li>
                    <li>Use the Schedule Planner</li>
                    <li>View course recommendations</li>
                    <li>View reviews of 100-level and FYSE courses</li>
                    <li>View the last 3 reviews of any instructor</li>
                    <li>View the last 3 reviews within a department</li>
                </ul>




                <Alert status="warning" style={{ boxSizing: 'border-box', borderRadius: '0.5rem' }}>
                    <AlertIcon />
                    <div>
                        <AlertTitle style={{ display: "inline-block" }}>
                            Do Not Submit a Review for a Course You Have Not Taken
                        </AlertTitle>
                        <AlertDescription>
                            <Text>
                                Attempts to submit a fraudulent review are caught quickly and result in a temporary or <b>permanent ban</b> from using midd.courses.
                            </Text>

                        </AlertDescription>
                    </div>
                </Alert>

                <p>
                    Keep in mind that midd.courses is a community resource. It is important that reviews are written by students who have completed the course. This ensures that reviews are accurate and helpful.
                    Please do not attempt to submit a review for a course you have not completed. This reduces the value of the site for other students as well as yourself.
                </p>

            </FaqContentWrapper>
        )
    },
    {
        title: "I've submitted reviews before but now I don't have access to the full site. What happened?",
        group: "Account",
        name: "no-access",
        contents: (

            <FaqContentWrapper>
                <p>
                    You must submit at least 2 reviews every six months to maintain access to the full site. If you have not submitted 2 reviews in the last six months, you will lose access to the full site.
                    We encourage you to review all your courses each semester. This helps keep the site up to date and ensures that you have access to the full site.
                </p>
                <p>You can view how many recent reviews you have on your <Link href="profile/reviews" passHref><a>review page</a></Link></p>
                {/* <p>To review the permissions you get by reviewing 2 courses, read <Link href="#access" passHref><a>this section</a></Link></p> */}
            </FaqContentWrapper>
        )
    },
    {
        title: "What if I don't want to write a review?",
        group: "Reviews",
        name: "no-review",
        contents: (
            <FaqContentWrapper>
                <p>
                    While we strongly encourage reviews and require them to unlock the full site, you do not have to write a review. You can still use midd.courses to view reviews of 100-level courses and see the previous 3 reviews of any instructor.
                </p>
            </FaqContentWrapper>
        )
    },
    {
        title: "When can I review a course I am currently taking?",
        group: "Reviews",
        name: "when-review",
        contents: (
            <FaqContentWrapper>
                <p>
                    Reviews open up after about two-thirds of the semester has passed, this is before the registration period for the next semester. In Fall, this is around mid-to-late-October, in J-term this is about the third week of January, and in Spring this is around early-April.
                </p>
            </FaqContentWrapper>
        )
    },
    {
        title: "What levels of access are there?",
        group: "Account",
        name: "access",
        contents: (
            <FaqContentWrapper>
                <div>
                    <ol>
                        <li><b>Logged-out</b>:<p>

                        </p>
                            <ul>
                                <li>Can view reviews for 100-level courses</li>
                                <li>Can view the last 3 reviews of any instructor</li>
                                <li>Can view course rankings</li>
                            </ul>
                        </li>
                        <li><b>Limited-access (logged-in)</b>:<p></p>

                            <ul>
                                <li>Can do all the above</li>
                                <li>Can use the Schedule Planner</li>
                                <li>Can bookmark courses</li>
                                <li>Can upvote, downvote, and report reviews</li>
                                <li>Students can submit reviews</li>
                            </ul>

                        </li>

                        <li><b>Full-access</b>:

                            {/* <span>Full-access is the highest level of permission on MiddCourses. Students must submit two reviews every six months to maintain full-access.</span> */}
                            <ul>
                                <li>Can do all the above</li>
                                <li>Can access the entire site and view all reviews</li>
                                <li>Can get personalized recommendations (with 4+ total reviews)</li>
                            </ul>



                        </li>
                    </ol>

                </div>
            </FaqContentWrapper>
        )
    },
    {
        title: "How do I edit or delete a review?",
        group: "Reviews",
        contents: (
            <FaqContentWrapper>
                <p>
                    You can edit or delete a review by going to your <Link href="profile/reviews" passHref><a>reviews page</a></Link> and clicking the &ldquo;Edit Review&rdquo; button. You will be prompted to log in if you haven&apos;t already.
                </p>


            </FaqContentWrapper>
        )
    },
    {
        title: "How do I flag a review?",
        group: "Reviews",
        contents: (
            <FaqContentWrapper>
                <>
                    <p>
                        You can flag a review by clicking the flag icon on the review. You will be prompted to log in if you haven&apos;t already.
                    </p>

                    <ReviewCard
                        key={fakeFlagReview.reviewID}
                        review={fakeFlagReview}
                        instructor={null}
                        expandable={false}
                        identifyCourse={false}
                        identifyInstructor={false}
                        hideVoting={true}
                        hideFlag={false}
                        AddReview={null}
                    />
                </>
            </FaqContentWrapper>
        )
    },
    {
        title: "How do I vote on a review?",
        group: "Reviews",
        contents: (
            <FaqContentWrapper>
                <>
                    <p>
                        You can vote on a review by clicking the upvote or downvote icons on the review. You will be prompted to log in if you haven&apos;t already.
                    </p>

                    <ReviewCard
                        key={fakeFlagReview.reviewID}
                        review={{ ...fakeFlagReview, content: "This is a fake review to showcase voting. Click on the upvote or downvote icons to vote." }}
                        instructor={null}
                        expandable={false}
                        identifyCourse={false}
                        identifyInstructor={false}
                        hideVoting={false}
                        hideFlag={true}
                        AddReview={null}
                    />
                </>
            </FaqContentWrapper>
        )
    },
    {
        title: "My account was banned. Why?",
        group: "Account",
        contents: (
            <FaqContentWrapper>
                <p>
                    Accounts are primarily banned for submitting bad reviews. This includes submitting fraudulent reviews for courses you have not completed, submitting spam reviews, or submitting reviews that contain offensive content.
                </p>
                <p>If you believe this is an error, please contact us.</p>
            </FaqContentWrapper>
        )
    },
    {
        title: "How do I get personalized recommendations?",
        group: "Recommendations",
        contents: (
            <FaqContentWrapper>
                <p>
                    Personalized recommendations are available at the top of the course <Link href="/browse/courses" passHref><a>rankings & recommendation page</a></Link> for students who have submitted at least 4 reviews total and have at least 2 reviews in the last 6 months.


                </p>
            </FaqContentWrapper>
        )
    },
    {
        title: "Help! My recommendations are not accurate!",
        group: "Recommendations",
        contents: (
            <FaqContentWrapper>
                <p>
                    Recommendation accuracy is based on the reviews you submit and the reviews of other students. The more reviews you submit, the more accurate your recommendations will be. And the more accurate you make your reviews, the more accurate your recommendations will be.
                </p>
                <p>
                    For some departments with few reviews, recommendations may not be accurate. The best way to improve recommendations is to submit more reviews.

                </p>
            </FaqContentWrapper>
        )
    },

    {
        title: "How do I use the Schedule Planner?",
        group: "Schedule Planner",
        contents: (
            <FaqContentWrapper>
                <p>
                    The <Link href="/schedule" passHref><a>Schedule Planner</a></Link> allows you to plan your schedule for future semesters. You can add courses to your schedule and view your schedule in a calendar and list format.
                </p>
                <p>
                    Start by selecting a semester and creating a schedule. Once you have created a schedule, you can add courses to by clicking the button in the bottom right. Here you can add courses that you have bookmarked before.
                </p>
            </FaqContentWrapper>
        )
    },

];

const faqGroups: { [key: string]: Faq[] } = faqs.reduce((acc, cur) => {
    if (cur.group) {
        if (acc[cur.group]) {
            acc[cur.group].push(cur);
        } else {
            acc[cur.group] = [cur];
        }
    }
    return acc;
}, {});

const faqGroupNames = Object.keys(faqGroups);


export default function FAQ() {

    return (
        <>
            <PageTitle pageTitle="FAQ" />
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '50rem',
                marginLeft: 'auto',
                marginRight: 'auto',
            }}>
                <div style={{
                    marginBottom: '2rem',
                    marginTop: '1rem',
                    marginRight: 'auto',
                    marginLeft: 'auto',
                    textAlign: 'center',
                }}>
                    <h1>Frequently Asked Questions</h1>
                    <p>
                        <span>Have another question? </span>
                        <a href="https://github.com/Nicholas-Sliter/middcourses2/issues">Contact us</a>.
                    </p>
                </div>

                {/* <CustomAccordion data={faqs} /> */}

                {faqGroupNames.map((groupname) => {
                    return (
                        <div key={groupname}>
                            <h2>{groupname}</h2>
                            <CustomAccordion
                                key={groupname}
                                data={faqGroups[groupname]}
                            />
                        </div>
                    );




                })}

            </div>
            <Spacer style={{ height: "4rem" }} />
        </>
    );





}