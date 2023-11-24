import { Maybe } from "../lib/common/types";


function useLocalStorage<T>(key: string, initialValue?: Maybe<T>): [Maybe<T>, (value: T) => void] {

    const getStoredValue = () => {
        if (typeof window !== "undefined" && window.localStorage) {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        }
        return initialValue;
    };


    const setValue = (value: T) => {
        if (typeof window !== "undefined" && window.localStorage) {
            window.localStorage.setItem(key, JSON.stringify(value));
        }
    };

    return [getStoredValue(), setValue];

}

export default useLocalStorage;