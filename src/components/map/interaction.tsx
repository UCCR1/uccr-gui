import { featureCollection, lineString, point } from "@turf/helpers";
import { Layer, Source } from "@vis.gl/react-maplibre";
import { useCallback, useEffect, useMemo } from "react";
import { Vector } from "ts-matrix";
import useMapCallback from "@/hooks/map/use-map-callback";
import useMouseMapLocation from "@/hooks/map/use-mouse-map-location";
import useActiveSpline from "@/hooks/use-active-spline";
import useKeyDown from "@/hooks/use-key-down";
import { vectorData } from "@/lib/math-types";
import type { EditorSpline } from "@/lib/splines";
import { SPLINE_MAP, type SplineGeometry } from "@/lib/splines/spline-data";
import { useAppDispatch, useAppSelector } from "@/state";
import {
    addSegment,
    setActiveControlPoint,
    setActiveSegment,
    setActiveTool,
    updateSegmentGeometry,
} from "@/state/autonEditorSlice";
import InteractiveLayer, { IS_HOVERED_KEY } from "./interactive-layer";

export default function MapInteraction() {
    const activeSplineIndex = useAppSelector(
        (state) => state.autonEditor.activeSegmentIndex,
    );

    const activeControlPointIndex = useAppSelector(
        (state) => state.autonEditor.activeControlPointIndex,
    );

    const activeSpline = useActiveSpline();

    const dispatch = useAppDispatch();

    const updateSplineData = useCallback(
        (data: SplineGeometry) => {
            if (activeSplineIndex !== null) {
                dispatch(
                    updateSegmentGeometry({ index: activeSplineIndex, data }),
                );
            }
        },
        [activeSplineIndex, dispatch],
    );

    const activeTool = useAppSelector((state) => state.autonEditor.activeTool);

    const splineType = useAppSelector((state) => state.autonEditor.splineType);

    useMapCallback(
        "click",
        (event) => {
            if (activeSpline === null && activeTool === "spline") {
                dispatch(
                    addSegment(
                        SPLINE_MAP[splineType].withInitialPoint(
                            new Vector(event.lngLat.toArray()),
                        ).data,
                    ),
                );
            }
        },
        [activeSpline, activeTool, dispatch, addSegment, splineType],
    );

    useEffect(() => {
        if (
            (activeTool === "spline" && activeControlPointIndex !== 0) ||
            activeSpline == null
        ) {
            dispatch(setActiveControlPoint(null));
        }
    }, [activeControlPointIndex, activeTool, dispatch, activeSpline]);

    useKeyDown(() => {
        if (activeSpline) {
            if (activeTool === "spline") {
                dispatch(setActiveTool("drag"));
            } else if (activeTool === "drag") {
                if (activeControlPointIndex !== null) {
                    dispatch(setActiveControlPoint(null));
                } else if (activeSplineIndex !== null) {
                    dispatch(setActiveSegment(null));
                }
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
    controller: EditorSpline<SplineGeometry>;
    updateData: (data: SplineGeometry) => void;
}

function SplineHandles({ controller, updateData }: SplineHandlesProps) {
    const editorPoints = controller.getEditorPoints();

    const activeTool = useAppSelector((state) => state.autonEditor.activeTool);
    const activeControlPointIndex = useAppSelector(
        (state) => state.autonEditor.activeControlPointIndex,
    );

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

    const scrubLocation = useAppSelector(
        (state) => state.autonEditor.scrubLocation,
    );

    const scrubPoint = vectorData.safeParse(
        controller.evaluatePosition(scrubLocation)?.values,
    ).data;

    const dispatch = useAppDispatch();

    return (
        <>
            {editorPoints.length >= 2 && (
                <>
                    {!controller.isInterpolated && (
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
                            id="spline-control-points"
                            type="circle"
                            paint={{
                                "circle-radius": [
                                    "case",
                                    [
                                        "==",
                                        ["get", "index"],
                                        ["number", activeControlPointIndex, -1],
                                    ],
                                    6,
                                    3,
                                ],
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
                            clickable={controller.hasEditorPointHandles}
                            onClick={(e) => {
                                if (activeTool === "drag") {
                                    dispatch(
                                        setActiveControlPoint(
                                            e.feature.properties.index,
                                        ),
                                    );
                                }
                            }}
                            onDrag={(e) => {
                                if (
                                    activeControlPointIndex !== null &&
                                    e.feature.properties.index !==
                                        activeControlPointIndex
                                ) {
                                    return;
                                }

                                if (activeTool !== "drag") {
                                    return;
                                }

                                updateData(
                                    controller.updateEditorPoint(
                                        e.feature.properties.index,
                                        new Vector(e.lngLat.toArray()),
                                    ),
                                );
                            }}
                        />
                    </Source>
                </>
            )}

            {activeControlPointIndex !== null && (
                <>
                    <Source
                        type="geojson"
                        generateId
                        data={featureCollection(
                            controller
                                .getEditorPointHandles(activeControlPointIndex)
                                .map((coord, index) =>
                                    point(coord.values, {
                                        index,
                                    }),
                                ),
                        )}
                    >
                        <InteractiveLayer
                            interactionWidth={15}
                            id="spline-control-point-handles"
                            type="circle"
                            paint={{
                                "circle-radius": 6,
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
                                if (activeTool !== "drag") {
                                    return;
                                }

                                updateData(
                                    controller.updateEditorPointHandle(
                                        activeControlPointIndex,
                                        e.feature.properties.index,
                                        new Vector(e.lngLat.toArray()),
                                    ),
                                );
                            }}
                        />
                    </Source>
                    <Source
                        type="geojson"
                        data={featureCollection(
                            controller
                                .getEditorPointHandles(activeControlPointIndex)
                                .map((coord) =>
                                    lineString([
                                        editorPoints[activeControlPointIndex]
                                            .values,
                                        coord.values,
                                    ]),
                                ),
                        )}
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

            {scrubPoint && (
                <Source type="geojson" data={point(scrubPoint)}>
                    <Layer
                        type="circle"
                        paint={{
                            "circle-radius": 10,
                            "circle-color": "white",
                        }}
                    />
                </Source>
            )}
        </>
    );
}
