import { Map as LibreMap, MapProvider } from "@vis.gl/react-maplibre";
import FieldModel from "./field-model";
import "maplibre-gl/dist/maplibre-gl.css";
import clsx from "clsx";
import { MousePointer2, PenTool } from "lucide-react";
import useActiveSpline from "@/hooks/use-active-spline";
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
import SideBar from "./side-bar";
import Timeline from "./timeline";

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
                    <Timeline />
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
        (state) => state.autonEditor.activeSegmentIndex !== null,
    );

    return (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-card p-2 rounded-md flex">
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
