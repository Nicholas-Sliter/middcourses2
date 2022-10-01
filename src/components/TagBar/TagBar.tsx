import { Tag } from "@chakra-ui/react";
import styles from "./TagBar.module.scss";

interface TagBarProps {
    items: string[];
    tagClick?: (tag: string) => void;
    tagClassName?: string;
    selectedTags?: string[];
    selectedTagClassName?: string;
}


function TagBar({
    items,
    tagClick = (item) => { },
    tagClassName = "",
    selectedTags = [],
    selectedTagClassName = "",
}: TagBarProps) {

    const selectedTagsSet = new Set(selectedTags);

    return (
        <div className={styles.tagBar}>
            {items?.map((item, i) => {
                const isSelected = selectedTagsSet.has(item);
                const tagClass = isSelected ? selectedTagClassName : tagClassName;

                return (
                    <Tag key={`${i}:${item}`} onClick={() => tagClick(item)} className={tagClass}>
                        {item}
                    </Tag>)
            }
            )}
        </div>
    );

}


export default TagBar;