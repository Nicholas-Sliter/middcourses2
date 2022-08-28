import { useState, useEffect } from 'react';


function useMobile() {
    const [width, setWidth] = useState<number>(undefined);

    function handleWindowSizeChange() {
        setWidth(window.innerWidth);
    }
    useEffect(() => {
        window.addEventListener('resize', handleWindowSizeChange);
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);
        }
    }, []);

    const isMobile = width <= 768;
    return isMobile;
}

export default useMobile;
