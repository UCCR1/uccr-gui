import { Matrix, Vector } from "ts-matrix";
import * as zod from "zod";
import { vectorData } from "../math-types";
import { EditorSpline } from ".";

export const B_SPLINE_NAME = "B-Spline";

export const cubicBSplineData = zod.object({
    type: zod.literal(B_SPLINE_NAME),
    points: zod.array(vectorData),
});

export type CubicBSplineData = zod.infer<typeof cubicBSplineData>;

export default class CubicBSpline extends EditorSpline<CubicBSplineData> {
    public readonly isInterpolated = false;
    public readonly hasEditorPointHandles = false;

    public getEditorPointHandles(): Vector[] {
        return [];
    }

    public updateEditorPointHandle() {
        return this.data;
    }

    public static withInitialPoint(point: Vector): CubicBSpline {
        return new CubicBSpline({
            type: B_SPLINE_NAME,
            points: [vectorData.parse(point.values)],
        });
    }

    public getCharacteristicMatrix(): Matrix {
        return new Matrix(4, 4, [
            [1 / 6, 2 / 3, 1 / 6, 0],
            [-1 / 2, 0, 1 / 2, 0],
            [1 / 2, -1, 1 / 2, 0],
            [-1 / 6, 1 / 2, -1 / 2, 1 / 6],
        ]);
    }

    public getControlPoints(mousePoint?: Vector): Vector[][] {
        const editorPoints = mousePoint
            ? [...this.getEditorPoints(), mousePoint]
            : this.getEditorPoints();

        if (editorPoints.length < 2) {
            return [];
        }

        const points = [
            editorPoints[0],
            editorPoints[0],
            ...editorPoints,
            editorPoints[editorPoints.length - 1],
            editorPoints[editorPoints.length - 1],
        ];

        const result: Vector[][] = [];

        for (let i = 0; i <= points.length - 4; i++) {
            result.push(points.slice(i, i + 4));
        }

        return result;
    }

    public getEditorPoints(): Vector[] {
        return this.data.points.map((x) => new Vector(x));
    }

    public addEditorPoint(index: number, position: Vector): CubicBSplineData {
        const newPoints = [...this.data.points];

        newPoints.splice(index, 0, vectorData.parse(position.values));

        return {
            type: B_SPLINE_NAME,
            points: newPoints,
        };
    }

    public updateEditorPoint(
        index: number,
        position: Vector,
    ): CubicBSplineData {
        const newPoints = [...this.data.points];

        newPoints[index] = vectorData.parse(position.values);

        return {
            type: B_SPLINE_NAME,
            points: newPoints,
        };
    }

    public removeEditorPoint(index: number): CubicBSplineData {
        const newPoints = [...this.data.points];

        newPoints.splice(index, 1);

        return {
            type: B_SPLINE_NAME,
            points: newPoints,
        };
    }
}
