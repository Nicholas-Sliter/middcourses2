import {
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
} from "@chakra-ui/react";
import styles from "../../styles/components/common/QuestionSlider.module.scss";

const DEFAULT_SLIDER_RATING = 5;

interface QuestionSliderProps {
  registerName: string;
  register: Function;
  validationObject?: Object;
  descriptor?: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
}

export default function QuestionSlider({
  registerName = "",
  register = () => { },
  validationObject = {},
  descriptor = "",
  min = 1,
  max = 10,
  step = 1,
  value
}: QuestionSliderProps) {
  const reg =
    registerName !== "" ? register(registerName, validationObject) : {};
  const onChange = (value: number) => {
    const e = {
      target: {
        value: value,
        name: registerName,
      },
    };
    reg.onChange(e);
  };

  const descriptorTag = <span className={styles.descriptor}>{descriptor}</span>


  return (
    <>
      {descriptorTag}
      <Slider
        name={registerName}
        {...reg}
        onChange={onChange}
        defaultValue={DEFAULT_SLIDER_RATING}
        min={min}
        max={max}
        step={step}
        value={value ?? undefined}
      >
        {/* <SliderMark value={min} />
        <SliderMark value={max} /> */}
        <SliderTrack>
          <SliderFilledTrack className={styles.filledTrack} />
        </SliderTrack>
        <SliderThumb boxSize={6} className={styles.thumb} />
      </Slider>
    </>
  );
}

// {...register(registerName)}
