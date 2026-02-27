import { ChevronDown } from "lucide-react";
import { getSplineController } from "@/lib/splines/spline-data";
import { useAppDispatch, useAppSelector } from "@/state";
import {
    setActiveSegment,
    updateSegmentGeometry,
} from "@/state/autonEditorSlice";
import { Button } from "../ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "../ui/collapsible";
import VertexInput from "../vertex-input";

export default function SideBar() {
    const auton = useAppSelector((state) => state.autonEditor.auton);

    const activeSegmentIndex = useAppSelector(
        (state) => state.autonEditor.activeSegmentIndex,
    );

    const dispatch = useAppDispatch();

    if (!auton) return;

    return (
        <div className="absolute right-5 top-5 bg-card p-2 rounded-md flex gap-2 w-96 flex-col items-stretch">
            {auton.segments.map((segment, segmentIndex) => {
                const controller = getSplineController(segment.geometry);
                return (
                    <Collapsible
                        key={`${segment.name}:${segmentIndex}`}
                        open={activeSegmentIndex === segmentIndex}
                        onOpenChange={(open) => {
                            if (open) {
                                dispatch(setActiveSegment(segmentIndex));
                            } else {
                                dispatch(setActiveSegment(null));
                            }
                        }}
                        className="group data-[state=open]:bg-secondary rounded-md"
                    >
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex justify-between p-2 items-center rounded-md w-full"
                            >
                                <span className="mr-auto">{segment.name}</span>
                                <span>{segment.geometry.type}</span>
                                <ChevronDown className="group-data-[state=open]:rotate-180" />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="flex flex-col pl-5">
                            {controller
                                .getEditorPoints()
                                .map((vertex, vertexIndex) => (
                                    <VertexInput
                                        vertex={vertex}
                                        key={[
                                            ...vertex.values,
                                            vertexIndex,
                                        ].join("-")}
                                        onChange={(newVertex) =>
                                            dispatch(
                                                updateSegmentGeometry({
                                                    index: segmentIndex,
                                                    data: controller.updateEditorPoint(
                                                        vertexIndex,
                                                        newVertex,
                                                    ),
                                                }),
                                            )
                                        }
                                    />
                                ))}
                        </CollapsibleContent>
                    </Collapsible>
                );
            })}
        </div>
    );
}
