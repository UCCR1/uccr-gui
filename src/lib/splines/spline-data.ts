import * as zod from "zod";
import type { EditorSpline } from ".";
import CubicBSpline, { cubicBSplineData } from "./b-spline";
import BezierSpline, { bezierSplineData } from "./bezier";

export const splineData = zod.discriminatedUnion("type", [
    cubicBSplineData,
    bezierSplineData,
]);

export type SplineData = zod.infer<typeof splineData>;

export function getSplineController(
    data: SplineData,
): EditorSpline<SplineData> {
    const type = data.type;

    if (type === "cubic-b-spline") {
        return new CubicBSpline(data);
    }

    if (type === "bezier-spline") {
        return new BezierSpline(data);
    }

    throw new Error(`Unrecognized spline type: ${type}`);
}
