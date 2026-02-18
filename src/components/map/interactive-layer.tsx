import { Layer, type LayerProps, useMap } from "@vis.gl/react-maplibre";
import type {
    CircleLayerSpecification,
    FillLayerSpecification,
    LineLayerSpecification,
    MapGeoJSONFeature,
    MapMouseEvent,
} from "maplibre-gl";
import { useCallback, useRef } from "react";
import { useMapLayerCallback } from "@/hooks/map/use-map-callback";

export const IS_HOVERED_KEY = "is-hovered";

type InteractiveLayerProps = Omit<
    FillLayerSpecification | CircleLayerSpecification | LineLayerSpecification,
    "source"
> & {
    id: string;

    interactionWidth?: number;

    draggable?: boolean;
    clickable?: boolean;

    onDrag?: (e: MapMouseEvent & { feature: MapGeoJSONFeature }) => void;
    onClick?: (e: MapMouseEvent & { feature: MapGeoJSONFeature }) => void;
    onUp?: (e: MapMouseEvent) => void;
};

export default function InteractiveLayer(props: InteractiveLayerProps) {
    const hoverable = props.draggable || props.clickable;

    const hoveredElement = useRef<MapGeoJSONFeature>(null);
    const dragging = useRef(false);

    const map = useMap();

    let interactionId = `${props.id}-interaction`;

    let interactionLayer = null;

    if (props.interactionWidth) {
        if (props.type === "line") {
            interactionLayer = (
                <Layer
                    {...(props as LayerProps)}
                    id={interactionId}
                    type="line"
                    paint={{
                        "line-width": props.interactionWidth,
                        "line-opacity": 0,
                    }}
                />
            );
        } else if (props.type === "circle") {
            interactionLayer = (
                <Layer
                    {...(props as LayerProps)}
                    id={interactionId}
                    type="circle"
                    paint={{
                        "circle-radius": props.interactionWidth / 2,
                        "circle-opacity": 0,
                    }}
                />
            );
        }
    }

    if (!interactionLayer) {
        interactionId = props.id;
    }

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
            if (hoveredElement.current && props.draggable) {
                dragging.current = true;
                e.target.getCanvas().style.cursor = "grabbing";

                props.onDrag?.(
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
        interactionId,
        (e) => {
            clearHover();

            if (!dragging.current) {
                if (props.draggable) {
                    e.target.getCanvas().style.cursor = "move";
                } else if (props.clickable) {
                    e.target.getCanvas().style.cursor = "pointer";
                }
            }

            hoveredElement.current = e.features?.[0] ?? null;

            if (hoveredElement.current && hoverable) {
                e.target.setFeatureState(hoveredElement.current, {
                    [IS_HOVERED_KEY]: true,
                });
            }
        },
        [props.id, hoveredElement.current, hoverable],
    );

    useMapLayerCallback(
        "mouseleave",
        interactionId,
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
        interactionId,
        (e) => {
            if (props.draggable) {
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
        interactionId,
        (e) => {
            if (hoveredElement.current && props.clickable) {
                props.onClick?.(
                    Object.assign(e, { feature: hoveredElement.current }),
                );
            }
        },
        [props.onClick, hoveredElement.current],
    );

    return (
        <>
            <Layer {...(props as LayerProps)} />
            {interactionLayer}
        </>
    );
}
