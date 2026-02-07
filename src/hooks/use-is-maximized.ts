import { getCurrentWindow } from "@tauri-apps/api/window";
import { useCallback, useEffect, useState } from "react";

const appWindow = getCurrentWindow();

export function useIsMaximized(): [boolean, (value: boolean) => void] {
    const [isMaximized, setIsMaximizedValue] = useState(true);

    useEffect(() => {
        appWindow.listen("tauri://resize", async () => {
            const maximized = await appWindow.isMaximized();

            setIsMaximizedValue(maximized);
        });
    }, []);

    const setIsMaximized = useCallback(async (value: boolean) => {
        if (value) {
            await appWindow.maximize();
        } else {
            await appWindow.unmaximize();
        }
    }, []);

    return [isMaximized, setIsMaximized];
}
