import clsx from "clsx";
import { Vector } from "ts-matrix";
import NumberInput from "./number-input";

interface VertexInputProps {
    vertex: Vector;
    onChange: (value: Vector) => void;

    className?: string;
}

export default function VertexInput({
    vertex,
    onChange,
    className,
}: VertexInputProps) {
    return (
        <div className={clsx("flex gap-1", className)}>
            {vertex.values.map((value, index) => (
                <NumberInput
                    key={[value, index].join("-")}
                    value={value}
                    className="w-8 focus:outline-0"
                    decimals={2}
                    min={0}
                    max={6}
                    onChange={(parsed) => {
                        const newValues = [...vertex.values];

                        newValues[index] = parsed;

                        onChange(new Vector(newValues));
                    }}
                />
            ))}
        </div>
    );
}
