import {
    Layer,
    Map as LibreMap,
    MapProvider,
    Source,
    useMap,
} from "@vis.gl/react-maplibre";
import FieldModel from "./field-model";
import "maplibre-gl/dist/maplibre-gl.css";
import { lineString } from "@turf/helpers";
import type { LngLat } from "maplibre-gl";
import { useEffect, useMemo, useState } from "react";
import { Vector } from "ts-matrix";
import CubicBSpline from "@/lib/splines/b-spline";
import CubicBezierSpline from "@/lib/splines/bezier";

export default function MapComponent() {
    return (
        <MapProvider>
            <div className="w-full h-full relative">
                <LibreMap
                    canvasContextAttributes={{
                        antialias: true,
                    }}
                    initialViewState={{
                        bounds: [0, 0, 6, 6],
                    }}
                    style={{
                        width: "100%",
                        height: "100%",
                    }}
                >
                    <FieldModel />
                    <DrawHandler />
                </LibreMap>
            </div>
        </MapProvider>
    );
}

function DrawHandler() {
    const map = useMap();

    const [i, setI] = useState(0);

    const [bSpline] = useState(new CubicBSpline());

    const splinePoints = useMemo(() => {
        return bSpline.renderSpline(0.1);
    }, [i, bSpline]);

    const editorPoints = useMemo(() => {
        return bSpline.getEditorPoints();
    }, [i, bSpline]);

    useEffect(() => {
        const sub = map.current?.on("mousemove", (event) => {
            if (editorPoints.length === 0) {
                bSpline.addEditorPoint(
                    0,
                    new Vector([event.lngLat.lng, event.lngLat.lat]),
                );
            } else {
                bSpline.updateEditorPoint(
                    editorPoints.length - 1,
                    new Vector([event.lngLat.lng, event.lngLat.lat]),
                );
            }

            setI((x) => x + 1);
        });

        return () => {
            sub?.unsubscribe();
        };
    }, [bSpline, map.current]);

    useEffect(() => {
        const sub = map.current?.on("click", (event) => {
            bSpline.addEditorPoint(
                editorPoints.length,
                new Vector([event.lngLat.lng, event.lngLat.lat]),
            );

            setI((x) => x + 1);
        });

        return () => {
            sub?.unsubscribe();
        };
    }, [bSpline, map.current]);

    return (
        <>
            {editorPoints.length >= 2 && (
                <Source
                    type="geojson"
                    data={lineString(editorPoints.map((coord) => coord.values))}
                >
                    <Layer
                        type="line"
                        paint={{
                            "line-color": "black",
                            "line-width": 4,
                            "line-dasharray": [2, 4],
                        }}
                    />
                    <Layer
                        type="circle"
                        paint={{
                            "circle-radius": 10,
                            "circle-color": "blue",
                            "circle-stroke-color": "black",
                            "circle-stroke-width": 5,
                        }}
                    />
                </Source>
            )}
            {splinePoints.length >= 2 && (
                <Source
                    type="geojson"
                    data={lineString(splinePoints.map((coord) => coord.values))}
                >
                    <Layer
                        type="line"
                        paint={{
                            "line-color": "red",
                            "line-width": 4,
                        }}
                    />
                </Source>
            )}
        </>
    );
}
