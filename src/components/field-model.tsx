import { useLoader } from "@react-three/fiber";
import { Canvas } from "react-three-map/maplibre";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function FieldModel() {
    const gltf = useLoader(GLTFLoader, "/pushback.gltf");

    return (
        <Canvas latitude={3} longitude={3}>
            <ambientLight intensity={0.8} />
            <directionalLight intensity={0.5} position={[2, 2, 2]} />

            <primitive
                object={gltf.scene}
                scale={1869e2}
                rotation={[0, Math.PI / 2, 0]}
            />
        </Canvas>
    );
}
