import { useEffect } from "react";

export default function useKeyDown(func: () => void, key: string) {
    useEffect(() => {
        const callback = (e: KeyboardEvent) => {
            if (e.key === key) {
                func();
            }
        };

        document.addEventListener("keydown", callback);

        return () => {
            document.removeEventListener("keydown", callback);
        };
    }, [func, key]);
}
