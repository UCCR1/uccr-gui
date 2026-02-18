import { featureCollection, lineString, point } from "@turf/helpers";
import { Layer, Source } from "@vis.gl/react-maplibre";
import { useCallback, useMemo } from "react";
import { Vector } from "ts-matrix";
import useMapCallback from "@/hooks/map/use-map-callback";
import useMouseMapLocation from "@/hooks/map/use-mouse-map-location";
import useKeyDown from "@/hooks/use-key-down";
import type { EditorSpline } from "@/lib/splines";
import BezierSpline from "@/lib/splines/bezier";
import {
    getSplineController,
    type SplineData,
} from "@/lib/splines/spline-data";
import { useAppDispatch, useAppSelector } from "@/state";
import {
    addSpline,
    setActiveSpline,
    setActiveTool,
    updateSpline,
} from "@/state/autonEditorSlice";
import InteractiveLayer, { IS_HOVERED_KEY } from "./interactive-layer";

export default function MapInteraction() {
    const activeSplineIndex = useAppSelector(
        (state) => state.autonEditor.activeSplineIndex,
    );

    const activeSpline = useAppSelector((state) =>
        activeSplineIndex !== null
            ? getSplineController(state.autonEditor.splines[activeSplineIndex])
            : null,
    );

    const dispatch = useAppDispatch();

    const updateSplineData = useCallback(
        (data: SplineData) => {
            if (activeSplineIndex !== null) {
                dispatch(updateSpline({ index: activeSplineIndex, data }));
            }
        },
        [activeSplineIndex, dispatch],
    );

    const activeTool = useAppSelector((state) => state.autonEditor.activeTool);

    useMapCallback(
        "click",
        (event) => {
            if (activeSpline === null && activeTool === "spline") {
                dispatch(
                    addSpline(
                        BezierSpline.withInitialPoint(
                            new Vector(event.lngLat.toArray()),
                        ).data,
                    ),
                );
            }
        },
        [activeSpline, activeTool, dispatch, addSpline],
    );

    useKeyDown(() => {
        if (activeSpline) {
            if (activeTool === "spline") {
                dispatch(setActiveTool("drag"));
            } else if (activeTool === "drag") {
                dispatch(setActiveSpline(null));
            }
        }
    }, "Escape");

    return (
        <>
            {activeSpline && (
                <SplineHandles
                    controller={activeSpline}
                    updateData={updateSplineData}
                />
            )}
        </>
    );
}

interface SplineHandlesProps {
    controller: EditorSpline<SplineData>;
    updateData: (data: SplineData) => void;
}

function SplineHandles({ controller, updateData }: SplineHandlesProps) {
    const editorPoints = controller.getEditorPoints();

    const activeTool = useAppSelector((state) => state.autonEditor.activeTool);

    useMapCallback(
        "click",
        (event) => {
            if (activeTool === "spline") {
                updateData(
                    controller.addEditorPoint(
                        editorPoints.length,
                        new Vector(event.lngLat.toArray()),
                    ),
                );
            }
        },
        [editorPoints.length, updateData, controller],
    );

    const mouseLocation = useMouseMapLocation();

    const splinePath = useMemo(() => {
        return lineString(
            controller
                .renderSpline(
                    0.01,
                    activeTool === "spline"
                        ? new Vector(mouseLocation.toArray())
                        : undefined,
                )
                .map((vector) => vector.values),
        );
    }, [controller, mouseLocation, activeTool]);

    return (
        <>
            {editorPoints.length >= 2 && (
                <>
                    {!controller.getIsInterpolated() && (
                        <Source
                            type="geojson"
                            data={lineString([
                                ...editorPoints.map((coord) => coord.values),
                                ...(activeTool === "spline"
                                    ? [mouseLocation.toArray()]
                                    : []),
                            ])}
                        >
                            <Layer
                                type="line"
                                paint={{
                                    "line-color": "black",
                                    "line-width": 2,
                                    "line-dasharray": [1, 2],
                                }}
                            />
                        </Source>
                    )}
                    <Source
                        type="geojson"
                        generateId
                        data={featureCollection(
                            editorPoints.map((coord, index) =>
                                point(coord.values, {
                                    index,
                                }),
                            ),
                        )}
                    >
                        <InteractiveLayer
                            interactionWidth={15}
                            id="spline-handles"
                            type="circle"
                            paint={{
                                "circle-radius": 3,
                                "circle-color": [
                                    "case",
                                    [
                                        "boolean",
                                        ["feature-state", IS_HOVERED_KEY],
                                        false,
                                    ],
                                    "cyan",
                                    "white",
                                ],
                                "circle-stroke-color": "cyan",
                                "circle-stroke-width": 1,
                            }}
                            draggable
                            onDrag={(e) => {
                                if (activeTool === "drag") {
                                    updateData(
                                        controller.updateEditorPoint(
                                            e.feature.properties.index,
                                            new Vector(e.lngLat.toArray()),
                                        ),
                                    );
                                }
                            }}
                        />
                    </Source>
                </>
            )}

            <Source type="geojson" data={splinePath}>
                <Layer
                    type="line"
                    paint={{
                        "line-width": 2,
                        "line-color": "cyan",
                    }}
                />
            </Source>
        </>
    );
}
