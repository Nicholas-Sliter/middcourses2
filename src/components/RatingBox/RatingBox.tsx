import { Tooltip } from "@chakra-ui/react";
import styles from "./RatingBox.module.scss";

interface RatingBoxProps {
    hide?: boolean;
    title: string;
    value?: number;
    min?: number;
    max?: number;
    highIsGood?: boolean;
    prefix?: string;
    suffix?: string;
    quantifier?: string;
    displayPrecision?: number;
    percent?: boolean;
    helpText?: string;
    vertical?: boolean;
    offset?: number;
}

function RatingBox({
    hide = false,
    title,
    value,
    min = 0,
    max = 10,
    highIsGood = true,
    prefix = "",
    suffix = "",
    quantifier = "",
    displayPrecision = 1,
    percent = false,
    helpText = "",
    vertical = false,
    offset = 0,
}: RatingBoxProps) {

    // offset is used to offset the color of the rating box if the expanded range does
    // not have the same meaning as the original range.  Ex. with hours per week.

    const containerClasses = [styles.container];
    if (vertical) {
        containerClasses.push(styles.vertical);
    }
    const containerClassName = containerClasses.join(" ");

    const range = max - min;

    //let boundNormalizedValue = Math.round(rating.value);
    const signedOffset = highIsGood ? offset : -offset;
    const percentageValue = (Math.max(min, (Math.min(value + signedOffset, max)) - min) / range);
    let boundNormalizedValue = Math.round(percentageValue * 10);
    if (!highIsGood) {
        boundNormalizedValue = 10 - boundNormalizedValue;
    }

    //console.table({ max, min, range, percentageValue, boundNormalizedValue });
    const colorMapping = {
        null: "darkgrey",
        NaN: "darkgrey",
        0: "#bd0000",
        1: "#bd0000",
        2: "#f93131",
        3: "#f95f31",
        4: "#ffa141",
        5: "#fdbb00",
        6: "#fdbb00",
        7: "#008000",
        8: "#008000",
        9: "#006400",
        10: "#006400",
    }



    //interpolate between a number and the number 2 away from it
    const interpolate = (a: number, b: number, t: number) => {
        return a + (b - a) * t;
    }

    //if value rounds to value equal or above 10, dont show any decimal places
    const decimalPlaces = Math.round(value) >= 10 ? 0 : displayPrecision ?? 1;

    let displayValue = Math.min(value, max)?.toFixed(decimalPlaces) ?? "N/A";
    if (value === null || value === undefined || isNaN(value)) {
        displayValue = "N/A";
    }
    //if display value end in 0, remove it
    if (displayValue.endsWith(".0")) {
        displayValue = displayValue.slice(0, -2);
    }

    if (value > max && !percent) {
        //add a + to the end of display value
        displayValue += "+";
    }

    if (percent && value !== null && value !== undefined) {
        displayValue = (value * 100).toFixed(displayPrecision ?? 0) ?? "N/A";
    }

    const color = (displayValue !== "N/A") ? colorMapping[boundNormalizedValue.toString()] : colorMapping["null"];

    if (displayValue === "N/A" || displayValue === "NaN") {
        suffix = "";
        quantifier = "";
    }


    if (hide) {
        return null;
    }

    let expandedHelpText = helpText ? `${displayValue}${suffix} ${helpText}` : null;
    if (displayValue === "N/A" || displayValue === "NaN") {
        expandedHelpText = "Not enough data to calculate this rating";
    }

    return (
        <div className={containerClassName}>
            <Tooltip label={expandedHelpText ?? null} placement="right">
                <div className={styles.box} style={{ backgroundColor: color }}>
                    <div>
                        <span>{displayValue}</span>
                        <span className={styles.suffix}>{suffix}</span>
                    </div>
                    <span className={styles.quantifier}>{quantifier}</span>
                </div>
            </Tooltip>
            <div className={styles.title}>
                {title}
            </div>
        </div >
    );

}

export default RatingBox;