import { Matrix, type Vector } from "ts-matrix";
import { EditorSpline } from ".";

export default class CubicBSpline extends EditorSpline {
    private editorPoints: Vector[] = [];

    public getCharacteristicMatrix(): Matrix {
        return new Matrix(4, 4, [
            [1 / 6, 2 / 3, 1 / 6, 0],
            [-1 / 2, 0, 1 / 2, 0],
            [1 / 2, -1, 1 / 2, 0],
            [-1 / 6, 1 / 2, -1 / 2, 1 / 6],
        ]);
    }

    public getControlPoints(): Vector[][] {
        if (this.editorPoints.length < 2) {
            return [];
        }

        const points = [
            this.editorPoints[0],
            this.editorPoints[0],
            ...this.editorPoints,
            this.editorPoints[this.editorPoints.length - 1],
            this.editorPoints[this.editorPoints.length - 1],
        ];

        const result: Vector[][] = [];

        for (let i = 0; i <= points.length - 4; i++) {
            result.push(points.slice(i, i + 4));
        }

        return result;
    }

    public getEditorPoints(): Vector[] {
        return this.editorPoints;
    }

    public addEditorPoint(index: number, position: Vector): void {
        this.editorPoints.splice(index, 0, position);
    }

    public updateEditorPoint(index: number, position: Vector): void {
        this.editorPoints[index] = position;
    }

    public removeEditorPoint(index: number): void {
        this.editorPoints.splice(index, 1);
    }
}
