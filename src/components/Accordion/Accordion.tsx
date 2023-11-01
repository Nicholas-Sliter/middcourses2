import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel } from "@chakra-ui/react";
import styles from "./Accordion.module.scss";


interface CustomAccordionProps {
    data: {
        title: string,
        contents: React.ReactNode,
        hidden?: boolean,
        name?: string,

    }[]
}


function CustomAccordion({ data }: CustomAccordionProps) {

    return (
        <Accordion allowToggle>
            {data.map((item, index) => (
                <AccordionItem key={index} >
                    <a style={{ display: "none" }}></a>
                    <h3>
                        <AccordionButton className={styles.accordionButton}>
                            <span>{item.title}</span>
                            <AccordionIcon />
                        </AccordionButton>
                    </h3>
                    <AccordionPanel>
                        {item.contents}
                    </AccordionPanel>
                </AccordionItem>
            ))
            }
        </Accordion >


    );



}


export default CustomAccordion;