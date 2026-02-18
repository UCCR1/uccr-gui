import * as zod from "zod";
import type { EditorSpline } from ".";
import CubicBSpline, { B_SPLINE_NAME, cubicBSplineData } from "./b-spline";
import BezierSpline, { BEZIER_NAME, bezierSplineData } from "./bezier";

export const splineData = zod.discriminatedUnion("type", [
    cubicBSplineData,
    bezierSplineData,
]);

export const splineTypes = splineData.options.map(
    (obj) => obj.shape.type.value,
);

export type SplineType = (typeof splineTypes)[number];

export type SplineData = zod.infer<typeof splineData>;

export function getSplineController(
    data: SplineData,
): EditorSpline<SplineData> {
    const type = data.type;

    if (type === "B-Spline") {
        return new CubicBSpline(data);
    }

    if (type === "Bezier") {
        return new BezierSpline(data);
    }

    throw new Error(`Unrecognized spline type: ${type}`);
}

export const SPLINE_MAP = {
    [B_SPLINE_NAME]: CubicBSpline,
    [BEZIER_NAME]: BezierSpline,
};
