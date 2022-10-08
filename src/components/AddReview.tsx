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
import { primaryComponents } from "../lib/common/utils";
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
    formState: { errors },
  } = useForm();

  const [instructorTerms, setInstructorTerms] = useState([]);
  const [filteredInstructors, setFilteredInstructors] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const toast = useToast();

  console.log("Errors: ", errors);

  const selectTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
      return;
    }

    //make sure the tags are unique, and there are no more than 3, and all tags in courseTags
    const uniqueTags = [...new Set([tag, ...selectedTags])];
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
      console.log(data);
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
        <ModalHeader>Review {course?.courseName ?? "a course"}</ModalHeader>
        <ModalCloseButton className={styles.closeButton} />
        <ModalBody>
          <form className={styles.form}>
            <FormControl>
              <Stack>
                <Question label="Course information" htmlFor="courseinfo">
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
                <Question
                  label="Would you take this course again?"
                  htmlFor="again"
                >
                  <Switch name="again" />
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
                <Question
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
                </Question>
                <Question
                  label="How many hours per week do you spend on this course outside of class?"
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
                  label="Select up to 3 tags that best describe this course"
                  htmlFor="courseTags"
                >
                  <TagBar
                    items={courseTags.sort()}
                    selectedTags={selectedTags}
                    tagClick={selectTag}
                    tagClassName={styles.tag}
                    selectedTagClassName={`${styles.tag} ${styles.selectedTag}`}
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
                  htmlFor="instructorAgain"
                >
                  <Switch name="instructorAgain" />
                </Question>
                <Question
                  label="I would take a course with this instructor again if I had the chance."
                  htmlFor="instructorAgain"
                >
                  <Switch name="instructorAgain" />
                </Question>
                <Spacer />
                <hr />
                <Spacer />
                <h4>{`Final comments`}</h4>
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
                    fieldState: { invalid, isTouched, isDirty, error },
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
    </Modal>
  );
}

//backdropFilter='blur(1px)'
