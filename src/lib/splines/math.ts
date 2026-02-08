import { Matrix, Vector } from "ts-matrix";

export function evaluateSpline(
    characteristicMatrix: Matrix,
    controlPoints: Vector[][],
    t: number,
): Vector {
    if (t < 0 - 0.0001 || t > controlPoints.length + 0.0001) {
        throw new Error(`Interpolation scalar t: ${t} is out of range`);
    }

    const degree = characteristicMatrix.columns - 1;

    // Clamp knotIndex to valid range to deal with floating point error
    const knotIndex = Math.min(
        Math.max(Math.ceil(t - 1), 0),
        controlPoints.length - 1,
    );

    const tVector = new Vector(
        Array.from({ length: degree + 1 }).map((_, i) => (t - knotIndex) ** i),
    );

    const coeff = tVector.multiplyMatrix(characteristicMatrix);

    if (controlPoints.some((segment) => segment.length !== degree + 1)) {
        throw new Error(
            `Spline of degree ${degree} must have chunks of ${degree + 1} control points`,
        );
    }

    const controlPointsMatrix = new Matrix(
        degree + 1,
        controlPoints[0][0].rows,
        controlPoints[knotIndex].map((x) => x.values),
    );

    return coeff.multiplyMatrix(controlPointsMatrix);
}
