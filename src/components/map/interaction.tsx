import { lineString } from "@turf/helpers";
import { Layer, Source } from "@vis.gl/react-maplibre";
import { useCallback, useEffect, useMemo } from "react";
import { Vector } from "ts-matrix";
import useMapCallback from "@/hooks/map/use-map-callback";
import useMouseMapLocation from "@/hooks/map/use-mouse-map-location";
import type { EditorSpline } from "@/lib/splines";
import CubicBSpline from "@/lib/splines/b-spline";
import {
    getSplineController,
    type SplineData,
} from "@/lib/splines/spline-data";
import { useAppDispatch, useAppSelector } from "@/state";
import {
    addSpline,
    setActiveSpline,
    updateSpline,
} from "@/state/autonEditorSlice";

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
                        CubicBSpline.withInitialPoint(
                            new Vector(event.lngLat.toArray()),
                        ).data,
                    ),
                );
            }
        },
        [activeSpline, activeTool, dispatch, addSpline],
    );

    useEffect(() => {
        if (activeTool === "drag" && activeSpline !== null) {
            dispatch(setActiveSpline(null));
        }
    }, [activeTool, activeSpline, dispatch]);

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
    const editorPoints = useMemo(() => {
        return controller.getEditorPoints();
    }, [controller]);

    useMapCallback(
        "click",
        (event) => {
            updateData(
                controller.addEditorPoint(
                    editorPoints.length,
                    new Vector(event.lngLat.toArray()),
                ),
            );
        },
        [editorPoints.length, updateData, controller],
    );

    const mouseLocation = useMouseMapLocation();

    const splinePath = useMemo(() => {
        return lineString(
            controller
                .renderSpline(0.01, new Vector(mouseLocation.toArray()))
                .map((vector) => vector.values),
        );
    }, [controller, mouseLocation]);

    return (
        <>
            {editorPoints.length >= 2 && (
                <Source
                    type="geojson"
                    data={lineString([
                        ...editorPoints.map((coord) => coord.values),
                        mouseLocation.toArray(),
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
                    <Layer
                        type="circle"
                        paint={{
                            "circle-radius": 3,
                            "circle-color": "white",
                            "circle-stroke-color": "cyan",
                            "circle-stroke-width": 1,
                        }}
                    />
                </Source>
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
