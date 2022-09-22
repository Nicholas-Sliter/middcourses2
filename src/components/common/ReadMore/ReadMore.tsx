import { useEffect, useState } from 'react';
import { Text } from '@chakra-ui/react';
import style from './ReadMore.module.scss';

function ReadMore({ text, maxLength = 100, disabled = false }) {
    const [isTruncated, setIsTruncated] = useState(!disabled);
    const resultString = isTruncated ? text.slice(0, maxLength) : text;
    const toggleIsTruncated = () => setIsTruncated(!isTruncated);

    return (
        <>
            {/* Full-text for SEO */}
            <Text className={style.fullText}>
                {text}
            </Text>
            <Text>
                {resultString}
                {text.length > maxLength && (
                    <>
                        <span>{" "}</span>
                        <a className={style.toggleLink} onClick={toggleIsTruncated}>
                            {isTruncated ? '…Read more' : 'Show less'}
                        </a>
                    </>
                )}
            </Text>
        </>
    );
}

export default ReadMore;