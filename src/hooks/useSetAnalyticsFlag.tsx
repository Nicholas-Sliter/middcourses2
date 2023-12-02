import { useEffect } from "react";
import { setAnalyticsFlag } from "../lib/frontend/utils";


function useSetAnalyticsFlag(key: string, value?: string | number | boolean | null, condition?: boolean) {

    useEffect(() => {
        if (!key) {
            return;
        }
        if (value === undefined || value === null) {
            return;
        }

        if (condition === false) {
            return;
        }


        setAnalyticsFlag(key, `${value}`);

    }, [key, value, condition]);
}

export default useSetAnalyticsFlag;