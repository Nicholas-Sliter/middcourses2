import { ScrollingCarousel } from "@trendyol-js/react-carousel";
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import NoSSRWrapper from "../../NoSSRWrapper";
import styles from "./ScrollableRow.module.scss";


interface ScrollableRowProps {
    children: JSX.Element[];
    className?: string;
    title?: string;
    center?: boolean;
}


function ScrollableRow({ children, className = "", center = false }: ScrollableRowProps) {
    const classNames = [styles.container].concat((center) ? styles.center : "").concat(className).join(" ");

    return (
        <NoSSRWrapper>
            <ScrollingCarousel
                leftIcon={<MdArrowBackIosNew />}
                rightIcon={<MdArrowForwardIos />}
                className={classNames}>
                {children}
            </ScrollingCarousel>
        </NoSSRWrapper>
    );


}

export default ScrollableRow;