import { Map as LibreMap, MapProvider } from "@vis.gl/react-maplibre";
import FieldModel from "./field-model";
import "maplibre-gl/dist/maplibre-gl.css";
import clsx from "clsx";
import { MousePointer2, PenTool } from "lucide-react";
import { type SplineType, splineTypes } from "@/lib/splines/spline-data";
import { useAppDispatch, useAppSelector } from "@/state";
import {
    type EditorTool,
    setActiveTool,
    setSplineType,
} from "@/state/autonEditorSlice";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
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
                </LibreMap>
            </div>
        </MapProvider>
    );
}

function EditorToolBar() {
    const activeTool = useAppSelector((state) => state.autonEditor.activeTool);
    const dispatch = useAppDispatch();

    const splineType = useAppSelector((state) => state.autonEditor.splineType);

    const hasActiveSpline = useAppSelector(
        (state) => state.autonEditor.activeSplineIndex !== null,
    );

    return (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-card p-2 rounded-md flex gap-2">
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
                    className={clsx(activeTool === "spline" && "pr-0")}
                >
                    <PenTool />
                    {activeTool === "spline" && (
                        <Select
                            disabled={hasActiveSpline}
                            value={splineType}
                            onValueChange={(type) =>
                                dispatch(setSplineType(type as SplineType))
                            }
                        >
                            <SelectTrigger className="w-[110px]">
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
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
    );
}
