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
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react";
import { useForm, useWatch } from "react-hook-form";
import { public_course, public_instructor } from "../lib/common/types";
import styles from "../styles/components/AddReview.module.scss";
import {
  difficultyMapping,
  valueMapping,
  standardMapping,
} from "../lib/frontend/utils";
import Question from "./common/Question";
import QuestionSlider from "./common/QuestionSlider";
import CharacterCount from "./common/CharacterCount";

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
  if (!isOpen) {
    return null;
  }

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm();

  const DEFAULT_SLIDER_RATING = 5;
  //use the useWatch hook to watch the difficulty form state
  const difficulty = useWatch({
    control,
    name: "difficulty",
    defaultValue: DEFAULT_SLIDER_RATING,
  });

  // const value = useWatch({
  //   control,
  //   name: "value",
  //   defaultValue: DEFAULT_SLIDER_RATING,
  // });

  const rating = useWatch({
    control,
    name: "rating",
    defaultValue: DEFAULT_SLIDER_RATING,
  });

  const review = useWatch({
    control,
    name: "review",
    defaultValue: "",
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
          <p>Add a review for this course</p>
          <form className={styles.form}>
            <FormControl>
              <Stack>
                <Question label="Course information" htmlFor="courseinfo">
                  <Select
                    name="instructor"
                    placeholder="Choose your instructor"
                    {...register("instructor", { required: true })}
                  >
                    {instructors.map((instructor) => (
                      <option
                        key={instructor.instructorID}
                        value={instructor.instructorID}
                      >
                        {instructor.name}
                      </option>
                    ))}
                  </Select>
                  <Select
                    name="semester"
                    placeholder="Select the semester"
                  ></Select>
                </Question>
                <Textarea
                  resize="none"
                  placeholder="Enter your review"
                  {...register("review", { required: true, minLength: 200, max: 2048 })}
                ></Textarea>
                <CharacterCount className={styles.characterCount} min={200} max={2048} count={review.length} />
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
                  label="How would you rate the course?"
                  htmlFor="rating"
                >
                  <span className={styles.ratingString}></span>
                  <QuestionSlider
                    registerName="rating"
                    register={register}
                    descriptor={valueMapping?.[rating] ?? null}
                  />
                </Question>
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
