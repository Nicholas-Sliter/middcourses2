import { Tag } from "@chakra-ui/react";
import styles from "./TagBar.module.scss";

interface TagBarProps {
    items: string[];
    tagClick?: (tag: string, tagGroup?: string[]) => void;
    tagClassName?: string;
    selectedTags?: string[];
    selectedTagClassName?: string;
    hasGroup?: boolean;
}


function TagBar({
    items,
    tagClick = (item, []) => { },
    tagClassName = "",
    selectedTags = [],
    selectedTagClassName = "",
    hasGroup = false,
}: TagBarProps) {

    const selectedTagsSet = new Set(selectedTags);

    const clickFun = (hasGroup) ? (tag, items) => tagClick(tag, items) : (tag, items) => tagClick(tag, []);


    return (
        <div className={styles.tagBar}>
            {items?.map((item, i) => {
                const isSelected = selectedTagsSet.has(item);
                const tagClass = isSelected ? selectedTagClassName : tagClassName;

                return (
                    <Tag key={`${i}:${item}`} onClick={() => clickFun(item, items)} className={tagClass}>
                        {item}
                    </Tag>)
            }
            )}
        </div>
    );

}


export default TagBar;