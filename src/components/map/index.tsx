import { Map as LibreMap, MapProvider } from "@vis.gl/react-maplibre";
import FieldModel from "./field-model";
import "maplibre-gl/dist/maplibre-gl.css";
import clsx from "clsx";
import { ChevronDown, MousePointer2, PenTool } from "lucide-react";
import {
    getSplineController,
    type SplineType,
    splineTypes,
} from "@/lib/splines/spline-data";
import { useAppDispatch, useAppSelector } from "@/state";
import {
    type EditorTool,
    setActiveSegment,
    setActiveTool,
    setSplineType,
    updateSegmentGeometry,
} from "@/state/autonEditorSlice";
import { Button } from "../ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "../ui/collapsible";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import VertexInput from "../vertex-input";
import AutonRenderer from "./auton-renderer";
import MapInteraction from "./interaction";

export default function MapComponent() {
    return (
        <MapProvider>
            <div className="w-full h-full relative">
                <LibreMap
                    canvasContextAttributes={{
                        antialias: true,
                    }}
                    initialViewState={{
                        bounds: [0, 0, 6, 6],
                    }}
                    style={{
                        width: "100%",
                        height: "100%",
                    }}
                >
                    <FieldModel />
                    <MapInteraction />
                    <AutonRenderer />
                    <EditorToolBar />
                    <SideBar />
                </LibreMap>
            </div>
        </MapProvider>
    );
}

function SideBar() {
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

function EditorToolBar() {
    const activeTool = useAppSelector((state) => state.autonEditor.activeTool);
    const dispatch = useAppDispatch();

    const splineType = useAppSelector((state) => state.autonEditor.splineType);

    const hasActiveSpline = useAppSelector(
        (state) => state.autonEditor.activeSegmentIndex !== null,
    );

    return (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-card p-2 rounded-md flex">
            <ToggleGroup
                type="single"
                spacing={2}
                value={activeTool}
                onValueChange={(val) =>
                    dispatch(setActiveTool(val as EditorTool))
                }
            >
                <ToggleGroupItem value="drag">
                    <MousePointer2 />
                </ToggleGroupItem>
                <ToggleGroupItem
                    value="spline"
                    className={clsx(
                        activeTool === "spline" && "rounded-r-none",
                    )}
                >
                    <PenTool />
                </ToggleGroupItem>
            </ToggleGroup>
            {activeTool === "spline" && (
                <Select
                    disabled={hasActiveSpline}
                    value={splineType}
                    onValueChange={(type) =>
                        dispatch(setSplineType(type as SplineType))
                    }
                >
                    <SelectTrigger className="w-[110px] rounded-l-none">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {splineTypes.map((label) => (
                                <SelectItem value={label} key={label}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            )}
        </div>
    );
}
