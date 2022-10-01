import { useEffect, useState } from 'react';
import { Text } from '@chakra-ui/react';
import style from './ReadMore.module.scss';

interface ReadMoreProps {
    text: string;
    maxLength: number;
    disabled?: boolean;
    baseBuffer?: number;
}

function ReadMore({ text, maxLength = 100, disabled = false, baseBuffer = 30 }: ReadMoreProps) {
    const [isTruncated, setIsTruncated] = useState(!disabled);

    const buffer = baseBuffer + "…Read more".length + 3;
    const totalLength = maxLength + buffer;

    const resultString = isTruncated ? text.slice(0, totalLength) : text;
    const toggleIsTruncated = () => setIsTruncated(!isTruncated);


    return (
        <>
            {/* Full-text for SEO */}
            <Text className={style.fullText}>
                {text}
            </Text>
            <Text>
                {resultString}
                {text.length > totalLength && (
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