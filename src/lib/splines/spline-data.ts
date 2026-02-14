import * as zod from "zod";
import type { EditorSpline } from ".";
import CubicBSpline, { cubicBSplineData } from "./b-spline";

export const splineData = zod.discriminatedUnion("type", [cubicBSplineData]);

export type SplineData = zod.infer<typeof splineData>;

export function getSplineController(
    data: SplineData,
): EditorSpline<SplineData> {
    if (data.type === "cubic-b-spline") {
        return new CubicBSpline(data);
    }

    throw new Error(`Unrecognized spline type: ${data.type}`);
}
