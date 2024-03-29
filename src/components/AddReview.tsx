import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  Select,
  Stack,
  Textarea,
  Switch,
  useToast,
  Spacer,
  Alert,
  AlertIcon,
  Text,
} from "@chakra-ui/react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { public_course, public_instructor, public_review } from "../lib/common/types";
import styles from "../styles/components/AddReview.module.scss";
import {
  difficultyMapping,
  valueMapping,
  standardMapping,
  convertTermToFullString,
  setAnalyticsFlag,
} from "../lib/frontend/utils";
import Question from "./common/Question";
import QuestionSlider from "./common/QuestionSlider";
import { areWeTwoThirdsThroughSemester, compareTerm, isInMajorMinorText, isNeitherText, isSemesterTooOld, parseCourseID, primaryComponents } from "../lib/common/utils";
import QuestionNumberInput from "./common/QuestionNumberInput";
import { useState, useEffect } from "react";
import ReviewContentInput from "./common/ReviewContentInput";
import { courseTags } from "../lib/common/utils";
import TagBar from "./TagBar";
import FormErrorMessage from "./common/FormErrorMessage";
import useSetAnalyticsFlag from "../hooks/useSetAnalyticsFlag";

interface AddReviewProps {
  course: public_course;
  instructors: public_instructor[];
  isOpen: boolean;
  onClose: () => void;
  edit?: boolean;
  review?: public_review;
}

export default function AddReview({
  course,
  instructors,
  isOpen,
  onClose,
  edit = false,
  review
}: AddReviewProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    setFocus,
    formState: { errors },
  } = useForm({});


  const [instructorTerms, setInstructorTerms] = useState([]);
  const [filteredInstructors, setFilteredInstructors] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitDebounce, setSubmitDebounce] = useState(false);

  const toast = useToast();

  useSetAnalyticsFlag('add_review_modal_used', isOpen, isOpen);

  const selectedTerm = watch("semester");

  const DEFAULT_SLIDER_RATING = 5;

  const difficulty = useWatch({
    control,
    name: "difficulty",
    defaultValue: DEFAULT_SLIDER_RATING,
  });

  const value = useWatch({
    control,
    name: "value",
    defaultValue: DEFAULT_SLIDER_RATING,
  });

  const rating = useWatch({
    control,
    name: "rating",
    defaultValue: DEFAULT_SLIDER_RATING,
  });

  const instructorEffectiveness = useWatch({
    control,
    name: "instructorEffectiveness",
    defaultValue: DEFAULT_SLIDER_RATING,
  });

  const instructorAccommodationLevel = useWatch({
    control,
    name: "instructorAccommodationLevel",
    defaultValue: DEFAULT_SLIDER_RATING,
  });

  const instructorEnthusiasm = useWatch({
    control,
    name: "instructorEnthusiasm",
    defaultValue: DEFAULT_SLIDER_RATING,
  });

  const inMajorMinor = useWatch({
    control,
    name: "inMajorMinor",
    defaultValue: "---",
  });

  const aliasID = useWatch({
    control,
    name: "alias",
    defaultValue: "",
  });

  // const again = useWatch({
  //   control,
  //   name: "again",
  //   defaultValue: 0,
  // });

  // const instructorAgain = useWatch({
  //   control,
  //   name: "instructorAgain",
  //   defaultValue: 0,
  // });

  // const instructorEnjoyed = useWatch({
  //   control,
  //   name: "instructorEnjoyed",
  //   defaultValue: 0,
  // });



  // const isLowEffortReview = isLowEffort({
  //   difficulty,
  //   value,
  //   rating,
  //   instructorEffectiveness,
  //   instructorAccommodationLevel,
  //   instructorEnthusiasm,
  //   instructorAgain,
  //   instructorEnjoyed,
  //   again
  // } as public_review);


  /* Assuming the aliasID as courseID reduces the number of different execution paths */
  const assumedCourseID = (aliasID) ? aliasID : course?.courseID;
  const assumedDepartment = parseCourseID(assumedCourseID).department;
  const assumedDepartmentName = (assumedCourseID === course?.courseID) ?
    course?.departmentName :
    assumedDepartment; /* We lose department name and just use code */
  /* TODO: write a query to fix this */


  //if edit and review, we need to set the initial values of the form
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    if (edit && review) {
      console.log(review);
      reset({

        semester: review.semester,
        instructor: review.instructorID,

        inMajorMinor: review.inMajorMinor,
        whyTake: review.whyTake,

        rating: review.rating,
        difficulty: review.difficulty,
        value: review.value,
        hours: `${review.hours}`,
        again: +review.again,

        instructorEffectiveness: review.instructorEffectiveness,
        instructorEnthusiasm: review.instructorEnthusiasm,
        instructorAccommodationLevel: review.instructorAccommodationLevel,
        instructorEnjoyed: review.instructorEnjoyed,
        instructorAgain: review.instructorAgain,

        tags: review.tags,
        primaryComponent: review?.primaryComponent,


        content: review.content,


      });
      setSelectedTags(review.tags);
    }
  }, [edit, review, reset, isOpen]);


  const selectTag = (tag: string, tagGroup: string[] = []) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
      return;
    }

    let newTags = [...selectedTags];
    if (tagGroup) {
      newTags = selectedTags.filter((t) => !tagGroup.includes(t));
    }

    newTags.push(tag);

    const uniqueTags = [...new Set(newTags)];
    const validTags = uniqueTags.filter((tag) => courseTags.includes(tag));
    if (validTags.length > 3) {
      toast({
        title: "You can only select up to 3 tags",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } else {
      setSelectedTags(validTags);
    }
  };

  const selectComponentTag = (tag: string, value: string[] = []) => {
    if (value.includes(tag)) {
      const newTags = value.filter((t) => t !== tag);
      return newTags;
    }

    const uniqueTags = [...new Set([tag, ...value])];
    const validTags = uniqueTags.filter((tag) => primaryComponents.includes(tag));
    if (validTags.length > 3) {
      toast({
        title: "You can only select up to 3 tags",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return value;
    }
    else {
      return validTags;
    }

  };

  const onSubmit = async (data: Object) => {
    if (submitDebounce) {
      return;
    }
    setSubmitDebounce(true);
    console.log(data);
    const dept = course.courseID.slice(0, 4).toLowerCase();
    const code = course.courseID.slice(4);

    //get contents so we can send it to a toast
    const res = await fetch(`/api/reviews/course/${dept}/${code}`, {
      method: (edit) ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        courseTags: selectedTags,
        courseID: course.courseID,
        aliasID: (aliasID) ? aliasID : undefined,
        reviewID: (edit) ? review.reviewID : undefined,
      }),
    });

    setAnalyticsFlag("add_review_submit", 'true');
    setAnalyticsFlag("add_review_edit", edit ? 'true' : 'false');

    if (!res.ok) {
      //throw new Error(`${res.status} ${res.statusText}`);
      console.error("Error submitting review");
      setAnalyticsFlag("add_review_error", 'true');
      const data = await res.json();
      toast({
        title: "Error submitting review",
        description: `${res.statusText}: ${data.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setSubmitDebounce(false);
      return;
    }

    onClose();
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    return res.text();
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    async function fetchInstructorTerms() {
      if (!course) {
        return;
      }
      const response = await fetch(
        `/api/course/${assumedCourseID.toUpperCase()}/term`
      );
      const { data } = await response.json();
      setInstructorTerms(data);
    }

    if (instructors.length > 0) {
      fetchInstructorTerms();
    }
  }, [instructors, isOpen, assumedCourseID]); // eslint-disable-line react-hooks/exhaustive-deps


  useEffect(() => {

    if (!isOpen) {
      return;
    }

    if (edit) {
      setFilteredInstructors(instructors);
      return;
    }

    if (!selectedTerm || selectedTerm === "") {
      return;
    }
    const instructorIDs = instructorTerms
      .filter((term) => term.term === selectedTerm)
      .map((term) => term.instructorID);

    const filteredInstructors = instructors.filter((instructor) =>
      instructorIDs.includes(instructor.instructorID)
    );

    setFilteredInstructors(filteredInstructors);
  }, [selectedTerm, isOpen, edit]); // eslint-disable-line react-hooks/exhaustive-deps

  const terms =
    instructorTerms?.map((iterm) => {
      return iterm.term;
    })
      .filter((term) => !isSemesterTooOld(term))
      .sort((a, b) => {
        return -compareTerm(a, b) // inverted order places more recent terms first
      }) ?? [];



  if (!isOpen) {
    return null;
  }

  const instructor = instructors.find((instructor) => {
    return instructor.instructorID === watch("instructor");
  });


  const headerText = (edit) ? "Edit Review" : `Review ${course?.courseName ?? 'a course'}`;


  const AliasSelection = () => {

    if (!(course?.aliases?.length) || course.aliases.length < 2) {
      return null;
    }


    return (
      <Question
        label={`Select course code`}
        htmlFor="courseAlias"
      >
        <span>This course is identified by multiple codes. Your review will be visible for all codes. Please select the code with the department you wish to review.</span>
        <Spacer />
        <Select
          name="Alias"
          placeholder="Select the course"
          disabled={edit}
          defaultValue={course.courseID}
          value={watch("alias")}
          {...register("alias", { required: { value: true, message: "A course must be selected" } })}
        >

          {course?.aliases?.map((alias) => {
            return (
              <option key={alias} value={alias}>
                {alias}
              </option>
            );
          })}
        </Select>
      </Question>
    );


  }


  return (
    <Modal
      isOpen={isOpen}
      closeOnOverlayClick={false}
      closeOnEsc={false}
      onClose={onClose}
      size="xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader className={styles.header}>{headerText}</ModalHeader>
        <ModalCloseButton className={styles.closeButton} />
        <ModalBody>
          <form className={styles.form}>
            <FormControl onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); /* prevent form submission */
              }
            }}>
              <Stack>
                <AliasSelection />
                <Question label={`Course identification ${(edit) ? " [not editable]" : ""} `} htmlFor="courseinfo">
                  <Select
                    name="semester"
                    placeholder="Select the semester"
                    disabled={edit}
                    value={watch("semester")}
                    {...register("semester", { required: { value: true, message: "A semester must be selected" } })}
                  >
                    {terms
                      .filter((term, index) => {
                        return terms.indexOf(term) === index;
                      })
                      .map((term) => {
                        return (
                          <option key={term} value={term} disabled={!areWeTwoThirdsThroughSemester(term)}>
                            {convertTermToFullString(term)}
                          </option>
                        );
                      })}
                  </Select>
                  <FormErrorMessage errors={errors} name="semester" />
                  <Select
                    name="instructor"
                    isDisabled={!selectedTerm || selectedTerm === ""}
                    placeholder="Choose your instructor"
                    value={instructor?.instructorID}
                    disabled={edit}
                    {...register("instructor", { required: { value: true, message: "An instructor must be selected" } })}
                  >
                    {filteredInstructors.map((instructor) => (
                      <option
                        key={instructor.instructorID}
                        value={instructor.instructorID}
                      >
                        {instructor.name}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage errors={errors} name="instructor" />
                </Question>

                <Question label="Is or was this course in your intended major or minor?" htmlFor="inMajorMinor">
                  <Select
                    name="inMajorMinor"
                    placeholder="Choose major/minor status"
                    {...register("inMajorMinor",
                      {
                        required: { value: true, message: "You must select if this course is in your major or minor" }
                      })}
                    value={inMajorMinor}
                  >
                    <option value="major">I intend to major in {assumedDepartmentName}</option>
                    <option value="minor">I intend to minor in {assumedDepartmentName}</option>
                    <option value="major">I formerly intended to major in {assumedDepartmentName}</option>
                    <option value="minor">I formerly intended to minor in {assumedDepartmentName}</option>
                    <option value="neither">Neither</option>
                  </Select>
                  <FormErrorMessage errors={errors} name="inMajorMinor" />
                </Question>

                <Question label="Why did you choose to take this course?" htmlFor="whyTake">
                  <Select
                    name="whyTake"
                    placeholder="Choose why you took this course"
                    value={watch("whyTake")}
                    {...register("whyTake", {
                      required: { value: true, message: "You must select why you took this course." },
                      validate: {
                        notConflicting: (value) => {
                          if (inMajorMinor === "neither" && (value.includes("Major") || value.includes("Minor"))) {
                            return "You cannot select this reason if the course is not in your major or minor.";
                          }
                          return true;
                        }
                      }
                    })}
                  >
                    <option value="Required for Major/Minor" disabled={inMajorMinor === "neither"}>Required for Major/Minor</option>
                    <option value="Elective for Major/Minor" disabled={inMajorMinor === "neither"}>Elective for Major/Minor</option>
                    <option value="Specific interest">Specific interest</option>
                    <option value="Distribution elective">Distribution requirement</option>
                    <option value="Pre-requisite for later courses">Pre-requisite for later courses</option>
                    <option value="Someone recommended it">Someone recommended it</option>
                    <option value="To try something new">To try something new</option>
                    <option value="Needed to fill schedule">Needed to fill schedule</option>
                    <option value="Other">Other</option>

                  </Select>
                  <FormErrorMessage errors={errors} name="whyTake" />
                </Question>

                <Question
                  label="How difficult was the course?"
                  htmlFor="difficulty"
                >
                  <QuestionSlider
                    register={register}
                    registerName="difficulty"
                    descriptor={difficultyMapping?.[difficulty] ?? null}
                    value={difficulty}
                  />
                </Question>

                <Question
                  label="How valuable did you find the material from this course?"
                  htmlFor="value"
                >
                  <QuestionSlider
                    registerName="value"
                    register={register}
                    descriptor={valueMapping?.[value] ?? null}
                    value={value}
                  />
                </Question>

                <Question
                  label="Select between 1 and 3 major components of this course."
                  htmlFor="primaryComponent"
                >
                  <Controller
                    control={control}
                    name="primaryComponent"
                    rules={{
                      required: { value: true, message: "You must select between 1 and 3 components" },
                      minLength: { value: 1, message: "You must select at least 1 component" },
                      maxLength: { value: 3, message: "You cannot select more than 3 components" }
                    }}
                    render={({
                      field: { onChange, value, onBlur, ref },
                    }) => (
                      <>
                        <TagBar
                          items={primaryComponents.sort()}
                          selectedTags={value}
                          tagClick={(tag, tagGroup) => {
                            const tags = selectComponentTag(tag, value);
                            onChange(tags);
                          }}
                          tagClassName={styles.tag}
                          selectedTagClassName={`${styles.tag} ${styles.selectedTag}`}
                        />
                        <div className={styles.spacer} />
                        <FormErrorMessage errors={errors} name="primaryComponent" />
                      </>
                    )}
                  />
                </Question>



                <Question
                  label="Approximately many hours per week do you normally spend on this course outside of class?"
                  htmlFor="hours"
                >
                  <QuestionNumberInput
                    registerName="hours"
                    register={register}
                    validationObject={{
                      inRange: (value: number) => {
                        return value >= 0 && value <= 30;
                      }

                    }}
                    min={0}
                    max={30}
                    step={1}
                    defaultValue={watch("hours")}
                  ></QuestionNumberInput>
                </Question>
                <Question
                  label="Select up to one tag per category that best describes this course for a total of at most 3 tags."
                  htmlFor="courseTags"
                >
                  {/*  */}
                  <div className={styles.spacer} />
                  {/* Course pacing */}
                  <p>Course pacing</p>
                  <TagBar
                    items={["Fast-Paced", "Chill and Relaxed", "Slow-Paced"]}
                    selectedTags={selectedTags}
                    tagClick={selectTag}
                    tagClassName={styles.tag}
                    selectedTagClassName={`${styles.tag} ${styles.selectedTag}`}
                    hasGroup
                  // renderButton
                  />
                  <hr />
                  {/* Course contents */}
                  <p>Coursework distribution</p>
                  <TagBar
                    items={["Project-Heavy", "Lots of Homework", "Constant Reading", "Endless Writing"]}
                    selectedTags={selectedTags}
                    tagClick={selectTag}
                    tagClassName={styles.tag}
                    selectedTagClassName={`${styles.tag} ${styles.selectedTag}`}
                    hasGroup
                  // renderButton
                  />
                  <hr />
                  {/* Grading style */}
                  <p>Grading style</p>
                  <TagBar
                    items={["Tough Grading", "Fair Grading", "Easy Grading", "Ungrading"]}
                    selectedTags={selectedTags}
                    tagClick={selectTag}
                    tagClassName={styles.tag}
                    selectedTagClassName={`${styles.tag} ${styles.selectedTag}`}
                    hasGroup
                  // renderButton
                  />
                  <hr />
                  {/* Examination style */}
                  <p>Exam style</p>
                  <TagBar
                    items={["Difficult Exams", "Easy Exams", "Project Exams", "No Exams"]}
                    selectedTags={selectedTags}
                    tagClick={selectTag}
                    tagClassName={styles.tag}
                    selectedTagClassName={`${styles.tag} ${styles.selectedTag}`}
                    hasGroup
                  />


                </Question>
                <Question
                  label="Would you take this course again?"
                  htmlFor="again"
                >
                  <Controller
                    control={control}
                    name="again"
                    defaultValue={+false}
                    render={({
                      field: { onChange, value, onBlur, ref },
                    }) => (
                      <>
                        <Switch
                          size="lg"
                          name="again"
                          value={value}
                          onChange={onChange}
                          defaultChecked={value}
                        />
                      </>
                    )}
                  />
                </Question>
                <Question
                  label="How would you rate your overall experience in this course?"
                  htmlFor="rating"
                >
                  <QuestionSlider
                    registerName="rating"
                    register={register}
                    descriptor={valueMapping?.[rating] ?? null}
                    value={rating}
                  />
                </Question>
                <Spacer />
                <hr />
                <Spacer />
                <h4>{`Review ${(instructor?.name) ? instructor?.name : "instructor"}`}</h4>
                <p>Please answer the following questions based on how much you agree with the statements.</p>
                <Question
                  label="I felt the instructor was effective and clear in their teaching."
                  htmlFor="instructorEffectiveness"
                >
                  <QuestionSlider
                    registerName="instructorEffectiveness"
                    register={register}
                    descriptor={
                      standardMapping?.[instructorEffectiveness] ??
                      null
                    }
                    value={instructorEffectiveness}
                  />
                </Question>
                <Question
                  label="I felt the instructor had enthusiasm for the course material."
                  htmlFor="instructorEnthusiasm"
                >
                  <QuestionSlider
                    registerName="instructorEnthusiasm"
                    register={register}
                    descriptor={
                      standardMapping?.[instructorEnthusiasm] ?? null
                    }
                    value={instructorEnthusiasm}
                  />
                </Question>
                <Question
                  label="I felt the instructor was accommodating to students' needs."
                  htmlFor="instructorAccommodationLevel"
                >
                  <QuestionSlider
                    registerName="instructorAccommodationLevel"
                    register={register}
                    descriptor={
                      standardMapping?.[
                      instructorAccommodationLevel
                      ] ?? null
                    }
                    value={instructorAccommodationLevel}
                  />
                </Question>
                <Question
                  label="I enjoyed the instructor's teaching style." //teaching style
                  htmlFor="instructorEnjoyed"
                >
                  <Controller
                    control={control}

                    name="instructorEnjoyed"
                    defaultValue={false}
                    render={({
                      field: { onChange, value, onBlur, ref },
                    }) => (
                      <>
                        <Switch name="instructorEnjoyed" size="lg" value={value} onChange={onChange} defaultChecked={value} />
                      </>
                    )}
                  />
                </Question>
                <Question
                  label="I would take a course with this instructor again if I had the chance."
                  htmlFor="instructorAgain"
                >
                  <Controller
                    control={control}
                    name="instructorAgain"
                    defaultValue={false}
                    render={({
                      field: { onChange, value, onBlur, ref, name },
                    }) => (
                      <>
                        <Switch name="instructorAgain" size="lg" value={value} onChange={onChange} defaultChecked={value} />
                      </>
                    )}
                  />
                </Question>
                <Spacer />
                <hr />
                <Spacer />
                <h4>{`Course experience`}</h4>
                <p>Briefly describe your experience in this course and highlight things that might be helpful for prospective students.</p>
                <Controller
                  control={control}
                  name="content"
                  rules={{
                    required: { value: true, message: "A review must be provided" },
                    minLength: { value: 200, message: "Your review must be at least 200 characters long" },
                    maxLength: { value: 2048, message: "Your review must be less than 2048 characters long" }
                  }}
                  render={({
                    field: { onChange, onBlur, value, name, ref },
                    fieldState: { isTouched, isDirty, error },
                    formState,
                  }) => (
                    <>
                      <ReviewContentInput
                        onChange={onChange}
                        value={value}
                        className={styles.characterCount}
                      />
                      <FormErrorMessage errors={errors} name="content" />
                    </>
                  )}
                />
                <Alert status="info" className={styles.info}><AlertIcon />{"Please note, low quality reviews will be removed and will not count towards your 2 review threshold"} </Alert>
                <Spacer />
                <Spacer />
                {/* {(isLowEffortReview) ? <Alert status="warning" className={styles.info}><AlertIcon />{"Your review has been automatically flagged as low effort. Please ensure you are accurately describing your experience in this course."} </Alert> : null} */}

                <input
                  className={styles.submitButton}
                  type="submit"
                  disabled={!errors}
                  onClick={handleSubmit(onSubmit)}
                  value={(edit) ? "Update Review" : "Submit Review"}
                />
              </Stack>
            </FormControl>
          </form>
        </ModalBody>
        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal >
  );
}