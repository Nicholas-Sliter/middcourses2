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
  Button,
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
import { primaryComponents } from "../lib/common/utils";
import QuestionNumberInput from "./common/QuestionNumberInput";

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

  const content = useWatch({
    control,
    name: "content",
    defaultValue: "",
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
                  {...register("content", {
                    required: true,
                    minLength: 200,
                    max: 2048,
                  })}
                ></Textarea>
                <CharacterCount
                  className={styles.characterCount}
                  min={200}
                  max={2048}
                  count={content.length}
                />
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
                  <QuestionSlider
                    registerName="rating"
                    register={register}
                    descriptor={valueMapping?.[rating] ?? null}
                  />
                </Question>
                <Question
                  label="How valuable did you find this course?"
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
                    name="primary"
                    placeholder="Choose a primary component"
                    {...register("primary", { required: true })}
                  >
                    {primaryComponents.map((component) => (
                      <option key={component} value={component}>
                        {component}
                      </option>
                    ))}
                  </Select>
                </Question>
                <Question
                  label="How many hours per week do you spend on this course outside of class?"
                  htmlFor="hours"
                >
                  <QuestionNumberInput
                    registerName="hours"
                    register={register}
                    min={0}
                    max={30}
                    step={1}
                  ></QuestionNumberInput>
                </Question>
                <hr />
                <h4>{`Review ${instructor?.name}`}</h4>
                <Question
                  label="How effective was the instructor?"
                  htmlFor="instructorEffectiveness"
                >
                  <QuestionSlider
                    registerName="instructorEffectiveness"
                    register={register}
                    descriptor={
                      standardMapping?.[watch("instructorEffectiveness")] ??
                      null
                    }
                  />
                </Question>
                <Question
                  label="How enthusatic was the instructor?"
                  htmlFor="instructorEnthusiasm"
                >
                  <QuestionSlider
                    registerName="instructorEnthusiasm"
                    register={register}
                    descriptor={
                      standardMapping?.[watch("instructorEnthusiasm")] ??
                      null
                    }
                  />
                </Question>
                <Question
                  label="How accommodating was the instructor?"
                  htmlFor="instructorAccommodationLevel"
                >
                  <QuestionSlider
                    registerName="instructorAccommodationLevel"
                    register={register}
                    descriptor={
                      standardMapping?.[watch("instructorAccommodationLevel")] ??
                      null
                    }
                  />
                </Question>
                <Question
                  label="Would you take a course with this instructor again?"
                  htmlFor="instructorAgain"
                >
                  <Switch name="instructorAgain" />
                </Question>
                <input className={styles.submitButton} type="submit" onClick={handleSubmit(onClose)} />
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
