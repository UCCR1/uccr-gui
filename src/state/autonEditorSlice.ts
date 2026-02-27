import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AutonData } from "@/lib/auton";
import {
    type SplineGeometry,
    type SplineType,
    splineTypes,
} from "@/lib/splines/spline-data";

export type EditorTool = "drag" | "spline";

interface AutonEditorState {
    auton: AutonData | null;
    activeSegmentIndex: number | null;
    activeControlPointIndex: number | null;

    splineType: SplineType;
    activeTool: EditorTool;

    scrubLocation: number;
}

const initialState: AutonEditorState = {
    auton: {
        name: "Auton1",
        segments: [],
    },

    activeSegmentIndex: null,
    activeControlPointIndex: null,

    splineType: splineTypes[0],
    activeTool: "drag",

    scrubLocation: 0,
};

const autonEditorSlice = createSlice({
    name: "autonEditor",
    initialState,
    reducers: {
        addSegment(state, action: PayloadAction<SplineGeometry>) {
            if (state.auton === null) return;

            state.auton.segments.push({
                geometry: action.payload,
                name: `Segment ${state.auton.segments.length + 1}`,
                triggers: [],
            });

            state.activeSegmentIndex = state.auton.segments.length - 1;
        },

        updateSegmentGeometry(
            state,
            action: PayloadAction<{ index: number; data: SplineGeometry }>,
        ) {
            if (state.auton === null) return;

            const { index, data } = action.payload;

            if (index >= state.auton.segments.length) {
                return;
            }

            state.auton.segments[index].geometry = data;
        },

        renameSegment(
            state,
            action: PayloadAction<{ index: number; name: string }>,
        ) {
            if (state.auton === null) return;

            const { index, name } = action.payload;

            state.auton.segments[index].name = name;
        },

        setActiveSegment(state, action: PayloadAction<number | null>) {
            if (state.auton === null) return;

            const index = action.payload;

            state.activeSegmentIndex = index;
            state.activeControlPointIndex = null;
            state.scrubLocation = 0;

            if (index !== null) {
                const spline = state.auton.segments[index].geometry;

                state.splineType = spline.type;
            }
        },

        setActiveControlPoint(state, action: PayloadAction<number | null>) {
            if (state.activeSegmentIndex !== null) {
                state.activeControlPointIndex = action.payload;
            }
        },

        setActiveTool(state, action: PayloadAction<EditorTool>) {
            state.activeTool = action.payload;
        },

        setSplineType(state, action: PayloadAction<SplineType>) {
            state.splineType = action.payload;
        },

        setScrubLocation(state, action: PayloadAction<number>) {
            state.scrubLocation = action.payload;
        },
    },
});

export const {
    addSegment,
    updateSegmentGeometry,
    renameSegment,
    setActiveSegment,
    setActiveControlPoint,
    setActiveTool,
    setSplineType,
    setScrubLocation,
} = autonEditorSlice.actions;

export default autonEditorSlice.reducer;
