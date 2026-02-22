import { getSplineController } from "@/lib/splines/spline-data";
import { useAppSelector } from "@/state";

export default function useActiveSpline() {
    const activeSplineIndex = useAppSelector(
        (state) => state.autonEditor.activeSegmentIndex,
    );

    const activeSpline = useAppSelector((state) =>
        activeSplineIndex !== null && state.autonEditor.auton !== null
            ? getSplineController(
                  state.autonEditor.auton?.segments[activeSplineIndex].geometry,
              )
            : null,
    );

    return activeSpline;
}
