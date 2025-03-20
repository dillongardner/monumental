import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva"; // For debugging movements

// Crane dimensions
const DIMENSIONS = {
    base: {
        radius: 0.5,
        height: 0.4,
        segments: 32
    },
    column: {
        width: 0.3,
        height: 2,
        depth: 0.3
    },
    elbow: {
        width: 1,
        height: 0.5,
        depth: 0.2
    },
    wrist: {
        width: 1,
        height: 0.15,
        depth: 0.15
    },
    gripper: {
        width: 0.2,
        height: 0.1,
        depth: 0.1
    }
};

const Crane = () => {
    // Control states
    const { swing, lift, elbow, wrist, gripper } = useControls({
        swing: { value: 0, min: -180, max: 180 },
        lift: { value: 1, min: 0.5, max: 3 }, // Simulating height in meters
        elbow: { value: 0, min: -90, max: 90 },
        wrist: { value: 0, min: -90, max: 90 },
        gripper: { value: 0, min: 0, max: 0.2 }, // Simulating opening range
    });

    return (
        <group position={[0, 0, 0]}>
            {/* Base (Swing rotation) */}
            <group rotation={[0, swing * (Math.PI / 180), 0]}>
                <mesh position={[0, DIMENSIONS.base.height/2, 0]}>
                    <cylinderGeometry args={[DIMENSIONS.base.radius, DIMENSIONS.base.radius, DIMENSIONS.base.height, DIMENSIONS.base.segments]} />
                    <meshStandardMaterial color="gray" />
                </mesh>

                {/* Lift Column */}
                <group position={[0, lift, 0]}>
                    <mesh position={[0, DIMENSIONS.column.height/2, 0]}>
                        <boxGeometry args={[DIMENSIONS.column.width, DIMENSIONS.column.height, DIMENSIONS.column.depth]} />
                        <meshStandardMaterial color="lightgray" />
                    </mesh>

                    {/* Elbow */}
                    <group rotation={[elbow * (Math.PI / 180), 0, 0]} position={[0, DIMENSIONS.column.height, 0]}>
                        <mesh position={[DIMENSIONS.elbow.width/2, 0, 0]}>
                            <boxGeometry args={[DIMENSIONS.elbow.width, DIMENSIONS.elbow.height, DIMENSIONS.elbow.depth]} />
                            <meshStandardMaterial color="blue" />
                        </mesh>

                        {/* Wrist */}
                        <group rotation={[wrist * (Math.PI / 180), 0, 0]} position={[DIMENSIONS.elbow.width, -DIMENSIONS.elbow.height, 0]}>
                            <mesh position={[DIMENSIONS.wrist.width/2, 0, 0]}>
                                <boxGeometry args={[DIMENSIONS.wrist.width, DIMENSIONS.wrist.height, DIMENSIONS.wrist.depth]} />
                                <meshStandardMaterial color="red" />
                            </mesh>

                            {/* Gripper */}
                            <mesh position={[DIMENSIONS.wrist.width, 0, 0]} scale={[1, 1, gripper]}>
                                <boxGeometry args={[DIMENSIONS.gripper.width, DIMENSIONS.gripper.height, DIMENSIONS.gripper.depth]} />
                                <meshStandardMaterial color="yellow" />
                            </mesh>
                        </group>
                    </group>
                </group>
            </group>
        </group>
    );
};

export default function Scene() {
    return (
        <Canvas camera={{ 
            position: [4, 2, 4],
            near: 0.1,
            far: 1000
        }}>
            <ambientLight />
            <directionalLight position={[2, 5, 2]} />
            <Crane />
        </Canvas>
    );
}
