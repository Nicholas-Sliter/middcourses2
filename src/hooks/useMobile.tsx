import { useState, useEffect } from 'react';


function useMobile(): boolean | undefined {
    const [width, setWidth] = useState<number>(undefined);

    function handleWindowSizeChange() {
        setWidth(window.innerWidth);
    }
    useEffect(() => {
        if (!window) {
            return;
        }

        setWidth(window.innerWidth); // for initial render width
        window.addEventListener('resize', handleWindowSizeChange);
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isMobile = (width !== undefined) ? width <= 768 : undefined;
    return isMobile;
}

export default useMobile;
