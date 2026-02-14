import { LngLat } from "maplibre-gl";
import { useState } from "react";
import useMapCallback from "./use-map-callback";

export default function useMouseMapLocation(): LngLat {
    const [location, setLocation] = useState<LngLat>(new LngLat(0, 0));

    useMapCallback(
        "mousemove",
        (event) => {
            setLocation(event.lngLat);
        },
        [setLocation],
    );

    return location;
}
