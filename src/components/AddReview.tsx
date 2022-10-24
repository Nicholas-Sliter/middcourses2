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
import { public_course, public_instructor } from "../lib/common/types";
import styles from "../styles/components/AddReview.module.scss";
import {
  difficultyMapping,
  valueMapping,
  standardMapping,
  convertTermToFullString,
} from "../lib/frontend/utils";
import Question from "./common/Question";
import QuestionSlider from "./common/QuestionSlider";
import CharacterCount from "./common/CharacterCount";
import { isInMajorMinorText, isNeitherText, primaryComponents } from "../lib/common/utils";
import QuestionNumberInput from "./common/QuestionNumberInput";
import { useState, useEffect } from "react";
import { RiContactsBookLine } from "react-icons/ri";
import ReviewContentInput from "./common/ReviewContentInput";
import { courseTags } from "../lib/common/utils";
import TagBar from "./TagBar";
import { ErrorMessage } from '@hookform/error-message';
import FormErrorMessage from "./common/FormErrorMessage";

interface AddReviewProps {
  course: public_course;
  instructors: public_instructor[];
  isOpen: boolean;
  onClose: () => void;
}

export default function AddReview({
  course,
  instructors,
  isOpen,
  onClose,
}: AddReviewProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    setFocus,
    formState: { errors },
  } = useForm();

  const [instructorTerms, setInstructorTerms] = useState([]);
  const [filteredInstructors, setFilteredInstructors] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedComponentTags, setSelectedComponentTags] = useState([]);

  const toast = useToast();


  const selectTag = (tag: string, tagGroup: string[] = []) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
      return;
    }

    let newTags = [...selectedTags];
    // check if another tag in the same group is already selected, if so, remove it
    if (tagGroup) {
      newTags = selectedTags.filter((t) => !tagGroup.includes(t));
    }

    newTags.push(tag);

    //make sure the tags are unique, and there are no more than 3, and all tags in courseTags
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
      // setSelectedComponentTags(newTags);
      return newTags;
    }

    //make sure the tags are unique, and there are no more than 3, and all tags in componentTags
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
      // setSelectedComponentTags(validTags);
      return validTags;
    }

  };

  const onSubmit = async (data: Object) => {
    console.log(data);
    const dept = course.courseID.slice(0, 4).toLowerCase();
    const code = course.courseID.slice(4);

    //get contents so we can send it to a toast
    const res = await fetch(`/api/reviews/course/${dept}/${code}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        courseTags: selectedTags,
        courseID: course.courseID,
      }),
    });

    if (!res.ok) {
      //throw new Error(`${res.status} ${res.statusText}`);
      console.log("Error submitting review");
      const data = await res.json();
      toast({
        title: "Error submitting review",
        description: `${res.statusText}: ${data.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    onClose();
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    return res.text();
  };

  useEffect(() => {
    async function fetchInstructorTerms() {
      if (!course) {
        return;
      }
      const response = await fetch(
        `/api/course/${course?.courseID.toUpperCase()}/term`
      );
      const { data } = await response.json();
      setInstructorTerms(data);
    }

    if (instructors.length > 0) {
      fetchInstructorTerms();
    }
  }, [instructors]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedTerm = watch("semester");

  useEffect(() => {
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
  }, [selectedTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const terms =
    instructorTerms?.map((iterm) => {
      return iterm.term;
    }) ?? [];

  const DEFAULT_SLIDER_RATING = 5;
  //use the useWatch hook to watch the difficulty form state
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

  //const inMajorMinor: string = watch("inMajorMinor");

  if (!isOpen) {
    return null;
  }

  const instructor = instructors.find((instructor) => {
    return instructor.instructorID === watch("instructor");
  });

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
        <ModalHeader className={styles.header}>Review {course?.courseName ?? "a course"}</ModalHeader>
        <ModalCloseButton className={styles.closeButton} />
        <ModalBody>
          <form className={styles.form}>
            <FormControl>
              <Stack>
                <Question label="Course identification" htmlFor="courseinfo">
                  <Select
                    name="semester"
                    placeholder="Select the semester"
                    {...register("semester", { required: { value: true, message: "A semester must be selected" } })}
                  >
                    {terms
                      .filter((term, index) => {
                        return terms.indexOf(term) === index;
                      })
                      .map((term) => {
                        return (
                          <option key={term} value={term}>
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
                    {...register("inMajorMinor", { required: { value: true, message: "You must select if this course is in your major or minor" } })}
                  >
                    <option value="major">I intend to major in {course.departmentName}</option>
                    <option value="minor">I intend to minor in {course.departmentName}</option>
                    <option value="major">I formerly intended to major in {course.departmentName}</option>
                    <option value="minor">I formerly intended to minor in {course.departmentName}</option>
                    <option value="neither">Neither</option>
                  </Select>
                  <FormErrorMessage errors={errors} name="inMajorMinor" />
                </Question>

                <Question label="Why did you choose to take this course?" htmlFor="whyTake">
                  <Select
                    name="whyTake"
                    placeholder="Choose why you took this course"
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
                  />
                </Question>

                {/* <Question
                  label="What is the primary component of the course?"
                  htmlFor="primaryComponent"
                >
                  <Select
                    name="primaryComponent"
                    placeholder="Choose a primary component"
                    {...register("primaryComponent", { required: { value: true, message: "A primary component must be selected" } })}
                  >
                    {primaryComponents.map((component) => (
                      <option key={component} value={component}>
                        {component}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage errors={errors} name="primaryComponent" />
                </Question> */}

                {/* 
                <Question
                  label="Select between 1 and 3 major component of this course."
                  htmlFor="primaryComponent"
                >
                  <TagBar
                    items={primaryComponents.sort()}
                    selectedTags={selectedComponentTags}
                    tagClick={selectComponentTag}
                    tagClassName={styles.tag}
                    selectedTagClassName={`${styles.tag} ${styles.selectedTag}`}
                  />
                  <FormErrorMessage errors={errors} name="primaryComponent" />
                </Question> */}

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
                        // renderButton
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
                  ></QuestionNumberInput>
                </Question>
                <Question
                  label="Select up to one tag per category that best describes this course for a total of at most 3 tags."
                  htmlFor="courseTags"
                >
                  {/*  */}
                  <div className={styles.spacer} />
                  {/* 
                  <p>Lecture usefulness</p>
                  <TagBar
                    items={["Skip Lectures", "Mandatory Attendance", "Incredible Lectures"]}
                    selectedTags={selectedTags}
                    tagClick={selectTag}
                    tagClassName={styles.tag}
                    selectedTagClassName={`${styles.tag} ${styles.selectedTag}`}
                    hasGroup
                  />
                  <hr /> */}
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
                  // renderButton
                  />
                  {/* 
                  <hr />
                  <p>Advice</p>
                  <TagBar
                    items={["Avoid this course", "Take with a different professor", "Must Take",]}
                    selectedTags={selectedTags}
                    tagClick={selectTag}
                    tagClassName={styles.tag}
                    selectedTagClassName={`${styles.tag} ${styles.selectedTag}`}
                    hasGroup
                  /> */}


                </Question>
                <Question
                  label="Would you take this course again?"
                  htmlFor="again"
                >
                  <Controller
                    control={control}
                    name="again"
                    defaultValue={false}
                    render={({
                      field: { onChange, value, onBlur, ref },
                    }) => (
                      <>
                        <Switch name="again" value={value} onChange={onChange} />
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
                        <Switch name="instructorEnjoyed" value={value} onChange={onChange} />
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
                        <Switch name="instructorAgain" value={value} onChange={onChange} />
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
                <Spacer />
                <Spacer />

                <input
                  className={styles.submitButton}
                  type="submit"
                  disabled={!errors}
                  onClick={handleSubmit(onSubmit)}
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

//backdropFilter='blur(1px)'
