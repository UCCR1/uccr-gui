import { featureCollection, lineString } from "@turf/helpers";
import { Source } from "@vis.gl/react-maplibre";
import { useMemo } from "react";
import { getSplineController } from "@/lib/splines/spline-data";
import { useAppDispatch, useAppSelector } from "@/state";
import { setActiveSegment } from "@/state/autonEditorSlice";
import InteractiveLayer, { IS_HOVERED_KEY } from "./interactive-layer";

const SPLINE_TOLERANCE = 0.01;

export default function AutonRenderer() {
    const activeSplineIndex = useAppSelector(
        (state) => state.autonEditor.activeSegmentIndex,
    );

    const splines = useAppSelector(
        (state) => state.autonEditor.auton?.segments ?? [],
    );

    const activeTool = useAppSelector((state) => state.autonEditor.activeTool);

    // biome-ignore lint/correctness/useExhaustiveDependencies: Avoid re-rendering all splines when only the currently edited spline is changing, and that is handled elsewhere
    const splinePaths = useMemo(() => {
        return featureCollection(
            splines.flatMap((x, index) => {
                if (index === activeSplineIndex) {
                    return [];
                }

                return lineString(
                    getSplineController(x.geometry)
                        .renderSpline(SPLINE_TOLERANCE)
                        .map((vector) => vector.values),
                    {
                        index,
                    },
                );
            }),
        );
    }, [activeSplineIndex, splines.length]);

    const dispatch = useAppDispatch();

    return (
        <Source type="geojson" data={splinePaths} generateId>
            <InteractiveLayer
                interactionWidth={15}
                id="all-splines"
                type="line"
                paint={{
                    "line-width": 2,
                    "line-color": [
                        "case",
                        ["boolean", ["feature-state", IS_HOVERED_KEY], false],
                        "cyan",
                        "black",
                    ],
                }}
                clickable={activeSplineIndex === null && activeTool === "drag"}
                onClick={(event) => {
                    dispatch(setActiveSegment(event.feature.properties.index));
                }}
            />
        </Source>
    );
}
