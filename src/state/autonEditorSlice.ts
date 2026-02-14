import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SplineData } from "@/lib/splines/spline-data";

export type EditorTool = "drag" | "spline";

interface AutonEditorState {
    splines: SplineData[];
    activeSplineIndex: number | null;
    activeTool: EditorTool;
}

const initialState: AutonEditorState = {
    splines: [],
    activeSplineIndex: null,

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
            state.activeSplineIndex = action.payload;
        },

        setActiveTool(state, action: PayloadAction<EditorTool>) {
            state.activeTool = action.payload;
        },
    },
});

export const { addSpline, updateSpline, setActiveSpline, setActiveTool } =
    autonEditorSlice.actions;

export default autonEditorSlice.reducer;
