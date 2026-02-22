import clsx from "clsx";
import { useCallback, useRef, useState } from "react";
import useKeyDown from "@/hooks/use-key-down";

interface NumberInputProps {
    value: number;
    onChange: (value: number) => void;
    decimals?: number;
    className?: string;
    min?: number;
    max?: number;
}

export default function NumberInput({
    value,
    onChange,
    decimals = 2,
    className,
    min,
    max,
}: NumberInputProps) {
    const [stringValue, setStringValue] = useState(value.toFixed(decimals));

    const inputRef = useRef<HTMLInputElement>(null);

    const handleNewValue = useCallback(
        (value: number) => {
            if (min !== undefined) {
                value = Math.max(value, min);
            }

            if (max !== undefined) {
                value = Math.min(value, max);
            }

            onChange(value);
        },
        [min, max, onChange],
    );

    const valueRef = useRef(value);

    const moved = useRef(false);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            valueRef.current += e.movementX * 0.01;

            if (e.movementX !== 0 || e.movementY !== 0) {
                moved.current = true;
            }

            handleNewValue(valueRef.current);
        },
        [handleNewValue],
    );

    const handleMouseUp = useCallback(() => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.exitPointerLock();

        if (!moved.current) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [handleMouseMove]);

    const handleMouseDown = useCallback(async () => {
        await document.body.requestPointerLock();

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        valueRef.current = value;
        moved.current = false;
    }, [value, handleMouseMove, handleMouseUp]);

    useKeyDown(() => {
        if (document.activeElement === inputRef.current) {
            inputRef.current?.blur();
        }
    }, "Enter");

    return (
        <div className="relative">
            <input
                ref={inputRef}
                value={stringValue}
                className={clsx(
                    className,
                    "hover:not-focus:cursor-move hover:bg-primary rounded-md hover:text-secondary text-center",
                )}
                onMouseDown={(e) => {
                    if (document.activeElement !== inputRef.current) {
                        handleMouseDown();

                        e.preventDefault();
                    }
                }}
                onBlur={() => {
                    const parsed = parseFloat(stringValue);

                    handleNewValue(parsed);
                }}
                onChange={(e) => {
                    setStringValue(e.target.value);
                }}
            />
        </div>
    );
}
