import { useMap } from "@vis.gl/react-maplibre";
import type {
    MapEventType,
    MapLayerEventType,
    Subscription,
} from "maplibre-gl";
import { type DependencyList, useEffect } from "react";

export default function useMapCallback<T extends keyof MapEventType>(
    type: T,
    listener: (ev: MapEventType[T]) => void,
    dependencies: DependencyList,
) {
    const map = useMap();

    // biome-ignore lint/correctness/useExhaustiveDependencies: dependency wrapper
    useEffect(() => {
        if (!map.current) return;

        const subscription = map.current.on(type, listener);

        return () => {
            subscription.unsubscribe();
        };
    }, [map.current, ...dependencies]);
}

export function useMapLayerCallback<T extends keyof MapLayerEventType>(
    type: T,
    layer: string | string[],
    listener: (ev: MapLayerEventType[T]) => void,
    dependencies: DependencyList,
) {
    const map = useMap();

    // biome-ignore lint/correctness/useExhaustiveDependencies: dependency wrapper
    useEffect(() => {
        if (!map.current) return;

        let subscription: Subscription;

        if (typeof layer === "string") {
            subscription = map.current.on(type, layer, listener);
        } else {
            subscription = map.current.on(type, layer, listener);
        }

        return () => {
            subscription.unsubscribe();
        };
    }, [map.current, ...dependencies]);
}
