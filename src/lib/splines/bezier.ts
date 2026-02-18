import { Matrix, Vector } from "ts-matrix";
import * as zod from "zod";
import { vectorData } from "../math-types";
import { EditorSpline } from ".";

export const BEZIER_NAME = "Bezier";

export const bezierSplineData = zod.object({
    type: zod.literal(BEZIER_NAME),
    points: zod.array(zod.object({ point: vectorData, direction: vectorData })),
});

export type BezierSplineData = zod.infer<typeof bezierSplineData>;

export default class BezierSpline extends EditorSpline<BezierSplineData> {
    public readonly isInterpolated = true;
    public readonly hasEditorPointHandles = true;

    public getEditorPointHandles(index: number): Vector[] {
        const point = this.data.points[index];

        const position = new Vector(point.point);
        const direction = new Vector(point.direction);

        if (index === 0) {
            return [position.add(direction)];
        } else if (index === this.data.points.length - 1) {
            return [position.subtract(direction)];
        }

        return [position.subtract(direction), position.add(direction)];
    }

    public updateEditorPointHandle(
        editorPointIndex: number,
        handleIndex: number,
        newPosition: Vector,
    ): BezierSplineData {
        const controlPosition = new Vector(
            this.data.points[editorPointIndex].point,
        );

        let direction = newPosition.subtract(controlPosition);

        if (handleIndex === 0 && editorPointIndex !== 0) {
            direction = direction.negate();
        }

        const newPoints = [...this.data.points];

        newPoints[editorPointIndex] = {
            point: vectorData.parse(controlPosition.values),
            direction: vectorData.parse(direction.values),
        };

        return {
            type: BEZIER_NAME,
            points: newPoints,
        };
    }

    public static withInitialPoint(point: Vector): BezierSpline {
        return new BezierSpline({
            type: BEZIER_NAME,
            points: [
                { point: vectorData.parse(point.values), direction: [0, 1] },
            ],
        });
    }

    public getCharacteristicMatrix(): Matrix {
        return new Matrix(4, 4, [
            [1, 0, 0, 0],
            [-3, 3, 0, 0],
            [3, -6, 3, 0],
            [-1, 3, -3, 1],
        ]);
    }

    private directionTolast(position: Vector) {
        const endPoint = this.data.points[this.data.points.length - 1];

        if (!endPoint) {
            return new Vector([0, 0]);
        }

        return position
            .subtract(
                new Vector(endPoint.point).add(new Vector(endPoint.direction)),
            )
            .normalize();
    }

    public getControlPoints(mousePoint?: Vector): Vector[][] {
        const points = [...this.data.points];

        if (mousePoint) {
            points.push({
                point: vectorData.parse(mousePoint.values),
                direction: vectorData.parse(
                    this.directionTolast(mousePoint).values,
                ),
            });
        }

        if (points.length < 2) return [];

        return points
            .map((position, i, arr) => {
                if (i === 0) {
                    return [];
                }

                const previousPoint = new Vector(arr[i - 1].point);
                const previousDirection = new Vector(arr[i - 1].direction);

                const nextPoint = new Vector(position.point);
                const nextDirection = new Vector(position.direction);

                return [
                    previousPoint,
                    previousPoint.add(previousDirection),
                    nextPoint.subtract(nextDirection),
                    nextPoint,
                ];
            })
            .filter((_, i) => i !== 0);
    }

    public getEditorPoints(): Vector[] {
        return this.data.points.map((x) => new Vector(x.point));
    }

    public addEditorPoint(index: number, position: Vector): BezierSplineData {
        const newPoints = [...this.data.points];

        newPoints.splice(index, 0, {
            point: vectorData.parse(position.values),
            direction: vectorData.parse(this.directionTolast(position).values),
        });

        return {
            type: BEZIER_NAME,
            points: newPoints,
        };
    }

    public updateEditorPoint(
        index: number,
        position: Vector,
    ): BezierSplineData {
        const newPoints = [...this.data.points];

        newPoints[index] = {
            point: vectorData.parse(position.values),
            direction: newPoints[index].direction,
        };

        return {
            type: BEZIER_NAME,
            points: newPoints,
        };
    }

    public removeEditorPoint(index: number): BezierSplineData {
        const newPoints = [...this.data.points];

        newPoints.splice(index, 1);

        return {
            type: BEZIER_NAME,
            points: newPoints,
        };
    }
}
