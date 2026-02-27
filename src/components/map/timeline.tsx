import { Slider } from "radix-ui";
import useActiveSpline from "@/hooks/use-active-spline";
import type { EditorSpline } from "@/lib/splines";
import type { SplineGeometry } from "@/lib/splines/spline-data";
import { useAppDispatch, useAppSelector } from "@/state";
import { setScrubLocation } from "@/state/autonEditorSlice";

export default function Timeline() {
    const spline = useActiveSpline();

    if (!spline) return null;

    return (
        <div className="absolute inset-x-0 bottom-0 bg-card p-5 overflow-x-auto flex">
            <TimelineGraphics spline={spline} />
        </div>
    );
}

interface TimelineGraphicsProps {
    spline: EditorSpline<SplineGeometry>;
}

const DISTANCE_MARKER_STEP = 0.25;
const DISTANCE_SCALE = 500;

function TimelineGraphics({ spline }: TimelineGraphicsProps) {
    const splineLength = spline.getLength();

    const width = splineLength * DISTANCE_SCALE;

    const distanceMarkers = Array.from(
        { length: splineLength / DISTANCE_MARKER_STEP },
        (_, i) => i * DISTANCE_MARKER_STEP,
    );

    const scrubLocation = useAppSelector(
        (state) => state.autonEditor.scrubLocation,
    );

    const scrubDistance = spline.getLengthAt(scrubLocation);

    const dispatch = useAppDispatch();

    return (
        <div className="relative">
            <Slider.Root
                defaultValue={[0]}
                value={[scrubDistance]}
                max={splineLength}
                min={0}
                step={0.01}
                onValueChange={(value) =>
                    dispatch(setScrubLocation(spline.getTAt(value[0])))
                }
                className="w-full absolute flex items-center h-5 touch-none select-none"
            >
                <Slider.Thumb className="bg-black p-1 rounded-sm">
                    <span>{scrubDistance.toFixed(2)}</span>
                </Slider.Thumb>
            </Slider.Root>
            <svg width={width} height={200} viewBox={`0 0 ${width} 200`}>
                <line
                    x1={scrubDistance * DISTANCE_SCALE}
                    x2={scrubDistance * DISTANCE_SCALE}
                    y1={20}
                    y2={200}
                    stroke="blue"
                    strokeWidth={2}
                />
                {distanceMarkers.map((distance) => {
                    const pos = distance * DISTANCE_SCALE;

                    return (
                        <>
                            <text
                                x={pos}
                                y={15}
                                fill="white"
                                textAnchor="middle"
                            >
                                {distance}
                            </text>
                            <line
                                key={distance}
                                x1={pos}
                                x2={pos}
                                y1={20}
                                y2={200}
                                strokeWidth={1}
                                stroke="white"
                                strokeDasharray="2, 2"
                            />
                        </>
                    );
                })}
            </svg>
        </div>
    );
}
