import type { Matrix, Vector } from "ts-matrix";
import { evaluateSplinePosition, renderSpline } from "./math";

interface MathematicalSpline {
    getCharacteristicMatrix(): Matrix;
    getControlPoints(): Vector[][];
}

interface SplineControls<T> {
    addEditorPoint(index: number, position: Vector): T;
    updateEditorPoint(index: number, newPosition: Vector): T;
    removeEditorPoint(index: number): T;

    getEditorPoints(): Vector[];

    getEditorPointHandles(index: number): Vector[];
    updateEditorPointHandle(
        editorPointIndex: number,
        handleIndex: number,
        newPosition: Vector,
    ): T;

    get hasEditorPointHandles(): boolean;
}

export abstract class EditorSpline<T>
    implements MathematicalSpline, SplineControls<T>
{
    private distanceMap: [number, number][] = [];

    constructor(public readonly data: T) {
        const characteristicMatrix = this.getCharacteristicMatrix();
        const controlPoints = this.getControlPoints();

        if (controlPoints.length === 0) {
            return;
        }

        const path = renderSpline(characteristicMatrix, controlPoints, 0.01);

        let pathLength = 0;

        this.distanceMap = path.map(([t, vector], i) => {
            if (i === 0) return [0, 0];

            pathLength += path[i - 1][1].distanceFrom(vector);

            return [t, pathLength];
        });
    }

    public abstract getCharacteristicMatrix(): Matrix;
    public abstract getControlPoints(mousePoint?: Vector): Vector[][];

    public abstract addEditorPoint(index: number, position: Vector): T;
    public abstract updateEditorPoint(index: number, newPosition: Vector): T;
    public abstract removeEditorPoint(index: number): T;

    public abstract getEditorPoints(): Vector[];
    public abstract getEditorPointHandles(index: number): Vector[];
    public abstract updateEditorPointHandle(
        editorPointIndex: number,
        handleIndex: number,
        newPosition: Vector,
    ): T;

    public abstract get hasEditorPointHandles(): boolean;

    public abstract get isInterpolated(): boolean;

    public getMaxT() {
        return this.distanceMap[this.distanceMap.length - 1]?.[0] ?? 0;
    }

    public getTAt(distance: number) {
        if (distance === 0) return 0;

        for (let i = 0; i < this.distanceMap.length; i++) {
            const [currentT, currentDistance] = this.distanceMap[i];

            if (currentDistance < distance) continue;

            if (currentDistance === distance) {
                return currentT;
            }

            const [previousT, previousDistance] = this.distanceMap[i - 1];

            return (
                previousT +
                ((currentT - previousT) * (distance - previousDistance)) /
                    (currentDistance - previousDistance)
            );
        }

        throw new Error(`distance: ${distance} is out of range`);
    }

    public getLengthAt(t: number) {
        if (t === 0) return 0;

        for (let i = 0; i < this.distanceMap.length; i++) {
            const [currentT, currentDistance] = this.distanceMap[i];

            if (currentT < t) continue;

            if (currentT === t) {
                return currentDistance;
            }

            const [previousT, previousDistance] = this.distanceMap[i - 1];

            return (
                previousDistance +
                ((currentDistance - previousDistance) * (t - previousT)) /
                    (currentT - previousT)
            );
        }

        throw new Error(`t: ${t} is out of range`);
    }

    public getLength() {
        return this.distanceMap[this.distanceMap.length - 1]?.[1] ?? 0;
    }

    public renderSpline(
        maxSegmentLength: number,
        mousePoint?: Vector,
    ): Vector[] {
        const characteristicMatrix = this.getCharacteristicMatrix();
        const controlPoints = this.getControlPoints(mousePoint);

        if (controlPoints.length === 0) {
            return [];
        }

        //Evaluate one point for every initial control point
        const points = renderSpline(
            characteristicMatrix,
            controlPoints,
            maxSegmentLength,
        );

        return points.map(([_t, vector]) => vector);
    }

    public evaluatePosition(t: number): Vector | null {
        const characteristicMatrix = this.getCharacteristicMatrix();
        const controlPoints = this.getControlPoints();

        if (controlPoints.length === 0) {
            return null;
        }

        return evaluateSplinePosition(characteristicMatrix, controlPoints, t);
    }
}
