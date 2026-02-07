import { Map as LibreMap } from "@vis.gl/react-maplibre";
import FieldModel from "./field-model";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapComponent() {
    return (
        <LibreMap
            canvasContextAttributes={{
                antialias: true,
            }}
            initialViewState={{
                bounds: [0, 0, 6, 6],
            }}
            style={{ width: 1200, height: 1200 }}
        >
            <FieldModel />
        </LibreMap>
    );
}
