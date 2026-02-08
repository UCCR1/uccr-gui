import type { Matrix, Vector } from "ts-matrix";
import { evaluateSpline } from "./math";

interface MathematicalSpline {
    getCharacteristicMatrix(): Matrix;
    getControlPoints(): Vector[][];
}

interface SplineControls {
    addEditorPoint(index: number, position: Vector): void;
    updateEditorPoint(index: number, newPosition: Vector): void;
    removeEditorPoint(index: number): void;
    getEditorPoints(): Vector[];
}

export abstract class EditorSpline
    implements MathematicalSpline, SplineControls
{
    public abstract getCharacteristicMatrix(): Matrix;
    public abstract getControlPoints(): Vector[][];

    public abstract addEditorPoint(index: number, position: Vector): void;
    public abstract updateEditorPoint(index: number, newPosition: Vector): void;
    public abstract removeEditorPoint(index: number): void;
    public abstract getEditorPoints(): Vector[];

    public renderSpline(maxSegmentLength: number): Vector[] {
        const characteristicMatrix = this.getCharacteristicMatrix();
        const controlPoints = this.getControlPoints();

        if (controlPoints.length === 0) {
            return [];
        }

        //Evaluate one point for every initial control point
        const initialPoints = Array.from({
            length: controlPoints.flat().length,
        }).map<[Vector, number]>((_, i) => {
            const t =
                i * (controlPoints.length / (controlPoints.flat().length - 1));

            return [evaluateSpline(characteristicMatrix, controlPoints, t), t];
        });

        let i = 0;

        // Iterate over generated segments inserting mid points, only continuing once the current segment is shorter than the maxSegmentLength
        while (i < initialPoints.length - 1) {
            const [currentPoint, t0] = initialPoints[i];
            const [nextPoint, t1] = initialPoints[i + 1];

            if (nextPoint.distanceFrom(currentPoint) > maxSegmentLength) {
                const t = (t0 + t1) / 2;
                initialPoints.splice(i + 1, 0, [
                    evaluateSpline(characteristicMatrix, controlPoints, t),
                    t,
                ]);
            } else {
                i++;
            }
        }

        return initialPoints.map(([vector]) => vector);
    }

    public evaluate(t: number): Vector | null {
        const characteristicMatrix = this.getCharacteristicMatrix();
        const controlPoints = this.getControlPoints();

        if (controlPoints.length === 0) {
            return null;
        }

        return evaluateSpline(characteristicMatrix, controlPoints, t);
    }
}
