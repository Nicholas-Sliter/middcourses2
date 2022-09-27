import { Tag } from "@chakra-ui/react";
import styles from "./TagBar.module.scss";


function TagBar({ items }: { items: string[] }) {

    return (
        <div className={styles.tagBar}>
            {items.map((item, i) => (
                <Tag key={`${i}:${item}`}>
                    {item}
                </Tag>
            )
            )}
        </div>
    );

}


export default TagBar;