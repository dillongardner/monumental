import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva"; // For debugging movements
import React from 'react';

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

// Define the props interface
interface CraneProps {
    craneState: {
        lift: number;
        swing: number;
        elbow: number;
        wrist: number;
        gripper: number;
    };
}

const Crane: React.FC<CraneProps> = ({ craneState }) => {
    // Destructure values from craneState, providing default values if craneState is null
    const { swing = 0, lift = 1, elbow = 0, wrist = 0, gripper = 0 } = craneState || {};
    // Control states

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

export default function Scene({ craneState }) {
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
                <Crane craneState={craneState} />
            </Canvas>
        </div>
    );
}
