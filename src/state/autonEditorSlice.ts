import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
    type SplineData,
    type SplineType,
    splineTypes,
} from "@/lib/splines/spline-data";

export type EditorTool = "drag" | "spline";

interface AutonEditorState {
    splines: SplineData[];
    activeSplineIndex: number | null;
    activeControlPointIndex: number | null;

    splineType: SplineType;
    activeTool: EditorTool;
}

const initialState: AutonEditorState = {
    splines: [],
    activeSplineIndex: null,
    activeControlPointIndex: null,

    splineType: splineTypes[0],
    activeTool: "drag",
};

const autonEditorSlice = createSlice({
    name: "autonEditor",
    initialState,
    reducers: {
        addSpline(state, action: PayloadAction<SplineData>) {
            state.splines.push(action.payload);

            state.activeSplineIndex = state.splines.length - 1;
        },

        updateSpline(
            state,
            action: PayloadAction<{ index: number; data: SplineData }>,
        ) {
            const { index, data } = action.payload;

            if (index >= state.splines.length) {
                return;
            }

            state.splines[index] = data;
        },

        setActiveSpline(state, action: PayloadAction<number | null>) {
            const index = action.payload;

            state.activeSplineIndex = index;
            state.activeControlPointIndex = null;

            if (index !== null) {
                const spline = state.splines[index];

                state.splineType = spline.type;
            }
        },

        setActiveControlPoint(state, action: PayloadAction<number | null>) {
            if (state.activeSplineIndex !== null) {
                state.activeControlPointIndex = action.payload;
            }
        },

        setActiveTool(state, action: PayloadAction<EditorTool>) {
            state.activeTool = action.payload;
        },

        setSplineType(state, action: PayloadAction<SplineType>) {
            state.splineType = action.payload;
        },
    },
});

export const {
    addSpline,
    updateSpline,
    setActiveSpline,
    setActiveControlPoint,
    setActiveTool,
    setSplineType,
} = autonEditorSlice.actions;

export default autonEditorSlice.reducer;
