import { featureCollection, lineString } from "@turf/helpers";
import { Layer, Source } from "@vis.gl/react-maplibre";
import { useMemo } from "react";
import { getSplineController } from "@/lib/splines/spline-data";
import { useAppSelector } from "@/state";

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
                .filter((_, i) => i !== activeSplineIndex)
                .map((x) =>
                    lineString(
                        getSplineController(x)
                            .renderSpline(SPLINE_TOLERANCE)
                            .map((vector) => vector.values),
                    ),
                ),
        );
    }, [activeSplineIndex, splines.length]);

    return (
        <Source type="geojson" data={splinePaths}>
            <Layer
                type="line"
                paint={{
                    "line-width": 2,
                    "line-color": "black",
                }}
            />
        </Source>
    );
}
