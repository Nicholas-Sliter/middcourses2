import { Button, Input } from "@chakra-ui/react";
import { useNumberInput } from "@chakra-ui/react";
import styles from "../../styles/components/common/QuestionNumberInput.module.scss";

interface QuestionNumberInputProps {
  registerName: string;
  register: Function;
  validationObject?: Object;
  descriptor?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
}

export default function QuestionNumberInput({
  registerName,
  register,
  validationObject = {},
  descriptor = "",
  min = 0,
  max = 10,
  step = 1,
  defaultValue = 0,
}: QuestionNumberInputProps) {


  const reg =
    registerName !== "" ? register(registerName, validationObject) : {};

  const onChange = (s: string) => {
    const e = {
      target: {
        value: parseInt(s, 10),
        name: registerName,
      },
    };
    reg.onChange(e);
  };

  const { getInputProps, getIncrementButtonProps, getDecrementButtonProps } =
    useNumberInput({
      step,
      defaultValue,
      min,
      max,
      precision: 0,
      onChange: (valueAsString, valueAsNumber) => onChange(valueAsString),
    });

  const inc = getIncrementButtonProps();
  const dec = getDecrementButtonProps();
  const input = getInputProps();


  return (
    <div className={styles.container}>
      <Input
        name={registerName}
        {...reg}
        className={styles.input}
        {...input}
      ></Input>
      <Button className={styles.button} {...dec}>
        -
      </Button>
      <Button className={styles.button} {...inc}>
        +
      </Button>
    </div>
  );
}
