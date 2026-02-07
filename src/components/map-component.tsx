import { Map as LibreMap, Source } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css"; // See notes below
import FieldModel from "./field-model";

export default function MapComponent() {
    return (
        <LibreMap
            initialViewState={{
                bounds: [0, 0, 6, 6],
            }}
            style={{ width: 1200, height: 1200 }}
        >
            <Source
                id="bounds"
                type="geojson"
                data={{
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [0, 0],
                                [0, 6],
                                [6, 6],
                                [6, 0],
                            ],
                        ],
                    },
                    properties: {},
                }}
            >
                <FieldModel />
            </Source>
        </LibreMap>
    );
}
