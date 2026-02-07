import { getCurrentWindow } from "@tauri-apps/api/window";
import { Maximize2, Minimize2, Minus, X } from "lucide-react";
import { useIsMaximized } from "@/hooks/use-is-maximized";
import { Button } from "./ui/button";

const appWindow = getCurrentWindow();

export default function TitleBar() {
    const [isMaximized, setIsMaximized] = useIsMaximized();

    return (
        <div
            className="bg-sidebar-accent flex justify-between p-1 items-center"
            data-tauri-drag-region
        >
            <div />
            <span className="text-xl pointer-events-none absolute left-1/2 -translate-x-1/2">
                UCCR GUI
            </span>
            <div className="space-x-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => appWindow.minimize()}
                >
                    <Minus />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMaximized(!isMaximized)}
                >
                    {isMaximized ? <Minimize2 /> : <Maximize2 />}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => appWindow.close()}
                >
                    <X />
                </Button>
            </div>
        </div>
    );
}
