import * as zod from "zod";

export const vectorData = zod.tuple([zod.number(), zod.number()]);
export type VectorData = zod.infer<typeof vectorData>;

export const matrixData = zod.array(zod.array(zod.number()));
export type MatrixData = zod.infer<typeof matrixData>;
