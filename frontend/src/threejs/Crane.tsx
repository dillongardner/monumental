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
        height: 3,
        depth: 0.3
    },
    elbow: {
        width: 1,
        height: 0.3,
        depth: 0.2
    },
    wrist: {
        width: 1,
        height: 0.15,
        depth: 0.15
    },
    lowerArm: {
        radius: 0.1,
        height: 0.5,
        segments: 32
    },
    gripper: {
        width: 0.5,
        height: 0.1,
        depth: 0.1
    }
};

// Add this constant at the top with other constants
const GLOBAL_SCALE = 8;

const Crane = () => {
    // Control states
    const { swing, lift, elbow, wrist, gripper } = useControls({
        lift: { value: 1, min: 0.0, max: 3 - DIMENSIONS.elbow.height }, // Simulating height in meters
        swing: { value: 0, min: -180, max: 180 },
        elbow: { value: 0, min: -90, max: 90 },
        wrist: { value: 0, min: -90, max: 90 },
        gripper: { value: 0, min: 0, max: 0.5 }, // Simulating opening range
    });

    return (
        <group position={[0, 0, 0]} scale={GLOBAL_SCALE}>
            <mesh position={[0, DIMENSIONS.base.height / 2, 0]}>
                <cylinderGeometry args={[DIMENSIONS.base.radius, DIMENSIONS.base.radius, DIMENSIONS.base.height, DIMENSIONS.base.segments]} />
                <meshStandardMaterial color="gray" />
            </mesh>
            {/* Base (Swing rotation) */}
            <group rotation={[0, swing * (Math.PI / 180), 0]}>


                {/* Lift Column - now fixed height */}
                <mesh position={[0, DIMENSIONS.column.height / 2 + DIMENSIONS.base.height, 0]}>
                    <boxGeometry args={[DIMENSIONS.column.width, DIMENSIONS.column.height, DIMENSIONS.column.depth]} />
                    <meshStandardMaterial color="lightgray" />
                </mesh>

                {/* Elbow - fixed position */}
                <group position={[0, lift + DIMENSIONS.base.height + DIMENSIONS.elbow.height, 0]}>
                    <mesh position={[DIMENSIONS.elbow.width / 2, -DIMENSIONS.elbow.height / 2, 0]}>
                        <boxGeometry args={[DIMENSIONS.elbow.width, DIMENSIONS.elbow.height, DIMENSIONS.elbow.depth]} />
                        <meshStandardMaterial color="blue" />
                    </mesh>

                    {/* Wrist - now rotates around its own axis */}
                    <group 
                        position={[DIMENSIONS.elbow.width, -DIMENSIONS.elbow.height, 0]} // Position at the end of the elbow
                    >
                        <group rotation={[0, elbow * (Math.PI / 180), 0]}> {/* Rotate wrist independently */}
                            <mesh position={[DIMENSIONS.wrist.width / 2, 0, 0]}>
                                <boxGeometry args={[DIMENSIONS.wrist.width, DIMENSIONS.wrist.height, DIMENSIONS.wrist.depth]} />
                                <meshStandardMaterial color="red" />
                            </mesh>

                            {/* Hand */}
                            <mesh position={[DIMENSIONS.wrist.width - DIMENSIONS.lowerArm.radius, -DIMENSIONS.lowerArm.height/2, 0]}>
                                <cylinderGeometry args={[DIMENSIONS.lowerArm.radius, DIMENSIONS.lowerArm.radius, DIMENSIONS.lowerArm.height, DIMENSIONS.lowerArm.segments]} />
                                <meshStandardMaterial color="lightgray" />
                            </mesh>
                            {/* Wrist rotation */}
                            <group position={[DIMENSIONS.wrist.width, -DIMENSIONS.lowerArm.height, 0]} rotation={[0, wrist * (Math.PI / 180), 0]}>
                                {/* Gripper */}
                                <mesh position={[DIMENSIONS.lowerArm.radius + gripper/2, 0 , 0]}>
                                    <boxGeometry args={[DIMENSIONS.gripper.width + gripper, DIMENSIONS.gripper.height, DIMENSIONS.gripper.depth]} />
                                    <meshStandardMaterial color="yellow" />
                                </mesh>
                            </group>

                        </group>
                    </group>
                </group>
            </group>
        </group>
    );
};

export default function Scene() {
    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <Canvas camera={{ 
                position: [50, 10, 16],  // Adjusted height to give more vertical space
                near: 0.1,
                far: 2000,  // Increased far clipping plane to ensure all elements are visible
                fov: 75
            }}>
                <ambientLight />
                <directionalLight position={[8, 20, 8]} />  {/* Adjusted for the new scale */}
                <Crane />
            </Canvas>
        </div>
    );
}
