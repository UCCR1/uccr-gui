import { useMap } from "@vis.gl/react-maplibre";
import { type CustomLayerInterface, MercatorCoordinate } from "maplibre-gl";
import { useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const modelAsMercatorCoordinate = MercatorCoordinate.fromLngLat([3, 3], 0);

const modelTransform = {
    translateX: modelAsMercatorCoordinate.x,
    translateY: modelAsMercatorCoordinate.y,
    translateZ: modelAsMercatorCoordinate.z,
    rotateX: Math.PI / 2,
    rotateY: Math.PI / 2,
    rotateZ: 0,
    scale: 1 / 214,
};

const customLayer: CustomLayerInterface = {
    id: "field-model",
    type: "custom",
    renderingMode: "3d",
    onAdd(map, gl) {
        this.camera = new THREE.Camera();
        this.scene = new THREE.Scene();

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 10, 0);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // Add rim light
        const rimLight = new THREE.DirectionalLight(0x4488ff, 0.3);
        rimLight.position.set(-5, 5, -5);
        this.scene.add(rimLight);

        // use the three.js GLTF loader to add the 3D model to the three.js scene
        const loader = new GLTFLoader();
        loader.load("/pushback.gltf", (gltf) => {
            const model = gltf.scene;

            model.castShadow = true;
            model.receiveShadow = true;
            this.scene.add(model);
        });
        this.map = map;

        // use the MapLibre GL JS map canvas for three.js
        this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true,
        });

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.renderer.autoClear = false;
    },
    render(gl, args) {
        const rotationX = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(1, 0, 0),
            modelTransform.rotateX,
        );
        const rotationY = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(0, 1, 0),
            modelTransform.rotateY,
        );
        const rotationZ = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(0, 0, 1),
            modelTransform.rotateZ,
        );

        const m = new THREE.Matrix4().fromArray(
            args.defaultProjectionData.mainMatrix,
        );
        const l = new THREE.Matrix4()
            .makeTranslation(
                modelTransform.translateX,
                modelTransform.translateY,
                modelTransform.translateZ,
            )
            .scale(
                new THREE.Vector3(
                    modelTransform.scale,
                    -modelTransform.scale,
                    modelTransform.scale,
                ),
            )
            .multiply(rotationX)
            .multiply(rotationY)
            .multiply(rotationZ);

        this.camera.projectionMatrix = m.multiply(l);
        this.renderer.resetState();
        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint();
    },
};

export default function FieldModel() {
    const map = useMap();

    useEffect(() => {
        const innerMap = map.current?.getMap();
        if (!innerMap) return;

        if (!innerMap.getLayer("field-model")) {
            innerMap.addLayer(customLayer);
        }
    }, [map.current]);

    return null;
}
