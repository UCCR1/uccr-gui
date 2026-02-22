import * as zod from "zod";
import { splineGeometry } from "./splines/spline-data";

const trigger = zod.object({
    t: zod.number().min(0).max(1),
    name: zod.string(),
    params: zod.record(zod.string(), zod.number()),
});

const autonSegment = zod.object({
    geometry: splineGeometry,
    name: zod.string(),
    triggers: zod.array(trigger),
});

export type AutonSegment = zod.infer<typeof autonSegment>;

export const autonData = zod.object({
    name: zod.string(),
    segments: zod.array(autonSegment),
});

export type AutonData = zod.infer<typeof autonData>;
