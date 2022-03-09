import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  InputRightAddon,
  Button,
  InputAddon,
  Input,
  StylesProvider,
  InputRightElement,
  InputGroup
} from "@chakra-ui/react";

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
  const { getInputProps, getIncrementButtonProps, getDecrementButtonProps } =
    useNumberInput({
      step,
      defaultValue,
      min,
      max,
      precision: 0,
    });

  const inc = getIncrementButtonProps();
  const dec = getDecrementButtonProps();
  const input = getInputProps();

  return (
    <div className={styles.container}>
        <Input className={styles.input} {...input}></Input>
        <Button className={styles.button} {...dec}>-</Button>
        <Button className={styles.button} {...inc}>+</Button>
    </div>
  );
}
