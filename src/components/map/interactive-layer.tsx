import { Layer, type LayerProps, useMap } from "@vis.gl/react-maplibre";
import type { MapGeoJSONFeature, MapMouseEvent } from "maplibre-gl";
import { useCallback, useRef } from "react";
import { useMapLayerCallback } from "@/hooks/map/use-map-callback";

export const IS_HOVERED_KEY = "is-hovered";

export default function InteractiveLayer(
    props: LayerProps & {
        id: string;
        onMove?: (e: MapMouseEvent & { feature: MapGeoJSONFeature }) => void;
        onClick?: (e: MapMouseEvent & { feature: MapGeoJSONFeature }) => void;
        onUp?: (e: MapMouseEvent) => void;
    },
) {
    const hoveredElement = useRef<MapGeoJSONFeature>(null);
    const dragging = useRef(false);

    const map = useMap();

    const clearHover = useCallback(() => {
        if (hoveredElement.current && map.current) {
            map.current.setFeatureState(hoveredElement.current, {
                [IS_HOVERED_KEY]: false,
            });
        }

        hoveredElement.current = null;
    }, [map.current]);

    const onMove = useCallback(
        (e: MapMouseEvent) => {
            if (hoveredElement.current && props.onMove) {
                dragging.current = true;
                e.target.getCanvas().style.cursor = "grabbing";

                props.onMove(
                    Object.assign(e, { feature: hoveredElement.current }),
                );
            }
        },
        [props],
    );

    const onUp = useCallback(
        (e: MapMouseEvent) => {
            dragging.current = false;

            clearHover();

            e.target.getCanvas().style.cursor = "";

            props.onUp?.(e);

            e.target.off("mousemove", onMove);
        },
        [props, onMove, clearHover],
    );

    useMapLayerCallback(
        "mouseenter",
        props.id,
        (e) => {
            clearHover();

            if (!dragging.current) {
                if (props.onMove) {
                    e.target.getCanvas().style.cursor = "move";
                } else if (props.onClick) {
                    e.target.getCanvas().style.cursor = "pointer";
                }
            }

            hoveredElement.current = e.features?.[0] ?? null;

            if (hoveredElement.current) {
                e.target.setFeatureState(hoveredElement.current, {
                    [IS_HOVERED_KEY]: true,
                });
            }
        },
        [props.id, hoveredElement.current],
    );

    useMapLayerCallback(
        "mouseleave",
        props.id,
        (e) => {
            if (dragging.current) {
                return;
            }

            clearHover();

            e.target.getCanvas().style.cursor = "";
        },
        [clearHover],
    );

    useMapLayerCallback(
        "mousedown",
        props.id,
        (e) => {
            if (props.onMove) {
                e.target.getCanvas().style.cursor = "grab";

                e.preventDefault();

                e.target.on("mousemove", onMove);

                e.target.once("mouseup", onUp);
            }
        },
        [onMove, onUp],
    );

    useMapLayerCallback(
        "click",
        props.id,
        (e) => {
            if (hoveredElement.current && props.onClick) {
                props.onClick(
                    Object.assign(e, { feature: hoveredElement.current }),
                );
            }
        },
        [props.onClick, hoveredElement.current],
    );

    return <Layer {...props} />;
}
