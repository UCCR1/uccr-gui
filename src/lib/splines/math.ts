import { Matrix, Vector } from "ts-matrix";

export function renderSpline(
    characteristicMatrix: Matrix,
    controlPoints: Vector[][],
    maxSegmentLength: number,
) {
    const initialPoints = Array.from({
        length: controlPoints.flat().length,
    }).map<[Vector, number]>((_, i) => {
        const t =
            i * (controlPoints.length / (controlPoints.flat().length - 1));

        return [
            evaluateSplinePosition(characteristicMatrix, controlPoints, t),
            t,
        ];
    });

    let i = 0;

    // Iterate over generated segments inserting mid points, only continuing once the current segment is shorter than the maxSegmentLength
    while (i < initialPoints.length - 1) {
        const [currentPoint, t0] = initialPoints[i];
        const [nextPoint, t1] = initialPoints[i + 1];

        if (nextPoint.distanceFrom(currentPoint) > maxSegmentLength) {
            const t = (t0 + t1) / 2;
            initialPoints.splice(i + 1, 0, [
                evaluateSplinePosition(characteristicMatrix, controlPoints, t),
                t,
            ]);
        } else {
            i++;
        }
    }

    return initialPoints.map<[number, Vector]>(([vector, t]) => [t, vector]);
}

export function evaluateSplinePosition(
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
