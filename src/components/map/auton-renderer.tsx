import { featureCollection, lineString } from "@turf/helpers";
import { Source } from "@vis.gl/react-maplibre";
import { useMemo } from "react";
import { getSplineController } from "@/lib/splines/spline-data";
import { useAppDispatch, useAppSelector } from "@/state";
import { setActiveSpline } from "@/state/autonEditorSlice";
import InteractiveLayer, { IS_HOVERED_KEY } from "./interactive-layer";

const SPLINE_TOLERANCE = 0.01;

export default function AutonRenderer() {
    const activeSplineIndex = useAppSelector(
        (state) => state.autonEditor.activeSplineIndex,
    );
    const splines = useAppSelector((state) => state.autonEditor.splines);

    // biome-ignore lint/correctness/useExhaustiveDependencies: Avoid re-rendering all splines when only the currently edited spline is changing, and that is handled elsewhere
    const splinePaths = useMemo(() => {
        return featureCollection(
            splines
                .map((x, index) =>
                    lineString(
                        getSplineController(x)
                            .renderSpline(SPLINE_TOLERANCE)
                            .map((vector) => vector.values),
                        {
                            index,
                        },
                    ),
                )
                .filter((_, i) => i !== activeSplineIndex),
        );
    }, [activeSplineIndex, splines.length]);

    const dispatch = useAppDispatch();

    return (
        <Source type="geojson" data={splinePaths} generateId>
            <InteractiveLayer
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
                onClick={(event) => {
                    dispatch(setActiveSpline(event.feature.properties.index));
                }}
            />
        </Source>
    );
}
