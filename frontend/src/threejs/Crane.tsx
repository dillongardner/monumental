import { Canvas } from "@react-three/fiber";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva"; // For debugging movements
import React from 'react';
import { CraneOrientation, CraneState } from '../types/crane';
import { Text } from '@react-three/drei';
import { XYZPositionTarget } from '../types/messages';

// Define the dimensions interface
interface CraneDimensions {
    base: {
        radius: number;
        height: number;
        segments: number;
    };
    column: {
        width: number;
        height: number;
        depth: number;
    };
    elbow: {
        width: number;
        height: number;
        depth: number;
    };
    upperArm: {
        radius: number;
        height: number;
        segments: number;
    };
    wrist: {
        width: number;
        height: number;
        depth: number;
    };
    lowerArm: {
        radius: number;
        height: number;
        segments: number;
    };
    gripper: {
        width: number;
        height: number;
        depth: number;
    };
}

// Default dimensions
// TODO these should be received from the backend
const DEFAULT_DIMENSIONS: CraneDimensions = {
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
    upperArm: {
        radius: 0.15,
        height: 0.5,
        segments: 32
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
const GLOBAL_SCALE = 6;

// Define the props interface
interface CraneProps {
    craneState: CraneState;
    orientation: CraneOrientation;
    dimensions?: CraneDimensions;
}

interface SceneProps {
    craneState: CraneState;
    orientation: CraneOrientation;
    dimensions?: CraneDimensions;
    targetPosition: XYZPositionTarget | null;
}

const Crane: React.FC<CraneProps> = ({ craneState, orientation, dimensions = DEFAULT_DIMENSIONS }) => {
    // Destructure values from craneState, providing default values if craneState is null
    const { swing, lift, elbow, wrist, gripper} = craneState;

    return (
        <group scale={GLOBAL_SCALE}>
        <group position={[orientation.x, orientation.y, orientation.z]} rotation={[0, 0, orientation.rotationZ * (Math.PI / 180)]}>
            <mesh position={[0, dimensions.base.height / 2, 0]}>
                <cylinderGeometry args={[dimensions.base.radius, dimensions.base.radius, dimensions.base.height, dimensions.base.segments]} />
                <meshStandardMaterial color="gray" transparent opacity={0.5} />
            </mesh>
            {/* Base (Swing rotation) */}
            <group rotation={[0, swing * (Math.PI / 180), 0]}>
                {/* Lift Column - now fixed height */}
                <mesh position={[0, dimensions.column.height / 2, 0]}>
                    <boxGeometry args={[dimensions.column.width, dimensions.column.height, dimensions.column.depth]} />
                    <meshStandardMaterial color="lightgray" />
                </mesh>

                {/* Elbow - fixed position */}
                <group position={[0, lift, 0]}>
                    <mesh position={[dimensions.elbow.width / 2, 0, 0]}>
                        <boxGeometry args={[dimensions.elbow.width, dimensions.elbow.height, dimensions.elbow.depth]} />
                        <meshStandardMaterial color="blue" />
                    </mesh>

                    {/* Upper Arm - connects elbow to wrist */}
                    <mesh position={[dimensions.elbow.width, -dimensions.upperArm.height/2, 0]}>
                        <cylinderGeometry args={[dimensions.upperArm.radius, dimensions.upperArm.radius, dimensions.upperArm.height, dimensions.upperArm.segments]} />
                        <meshStandardMaterial color="green" />
                    </mesh>

                    {/* Wrist - now rotates around its own axis */}
                    <group 
                        position={[dimensions.elbow.width, -dimensions.upperArm.height, 0]}  // Position at the end of the upper arm
                        rotation={[0, elbow * (Math.PI / 180), 0]}
                    >
                        
                            <mesh position={[dimensions.wrist.width / 2, 0, 0]}>
                                <boxGeometry args={[dimensions.wrist.width, dimensions.wrist.height, dimensions.wrist.depth]} />
                                <meshStandardMaterial color="red" />
                            </mesh>

                            {/* Hand */}
                            <mesh position={[dimensions.wrist.width , -dimensions.lowerArm.height/2, 0]}>
                                <cylinderGeometry args={[dimensions.lowerArm.radius, dimensions.lowerArm.radius, dimensions.lowerArm.height, dimensions.lowerArm.segments]} />
                                <meshStandardMaterial color="lightgray" />
                            </mesh>
                            {/* Wrist rotation */}
                            <group position={[dimensions.wrist.width, -dimensions.lowerArm.height, 0]}
                            rotation={[0, wrist * (Math.PI / 180), 0]}>
                                {/* Gripper */}
                                <mesh position={[0, 0 , 0]}>
                                    <boxGeometry args={[dimensions.gripper.width + gripper, dimensions.gripper.height, dimensions.gripper.depth]} />
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

export default function Scene({ craneState, orientation, dimensions, targetPosition }: SceneProps) {
    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <Canvas camera={{ 
                position: [50, 10, 16],
                near: 0.1,
                far: 2000,
                fov: 75
            }}>
                <ambientLight />
                <directionalLight position={[8, 20, 8]} />
                {/* Add red dot at world origin */}
                <mesh position={[0, 0, 0]} scale={GLOBAL_SCALE}>
                    <sphereGeometry args={[0.1, 32, 32]} />
                    <meshStandardMaterial color="red" />
                </mesh>
                <Text
                    position={[0.5 * GLOBAL_SCALE, 0, 0]}
                    fontSize={0.2 * GLOBAL_SCALE}
                    color="red"
                    anchorX="left"
                    anchorY="middle"
                >
                    World Origin
                </Text>
                {/* Add green dot at target position */}
                {targetPosition && (
                    <>
                        <mesh 
                            position={[
                                targetPosition.x * GLOBAL_SCALE, 
                                targetPosition.y * GLOBAL_SCALE, 
                                targetPosition.z * GLOBAL_SCALE
                            ]} 
                            scale={GLOBAL_SCALE}
                        >
                            <sphereGeometry args={[0.1, 32, 32]} />
                            <meshStandardMaterial color="green" />
                        </mesh>
                        <Text
                            position={[
                                (targetPosition.x + 0.5) * GLOBAL_SCALE, 
                                targetPosition.y * GLOBAL_SCALE, 
                                targetPosition.z * GLOBAL_SCALE
                            ]}
                            fontSize={0.2 * GLOBAL_SCALE}
                            color="green"
                            anchorX="left"
                            anchorY="middle"
                        >
                            Target Position
                        </Text>
                    </>
                )}
                <Crane 
                    craneState={craneState} 
                    orientation={orientation} 
                    dimensions={dimensions}
                />
            </Canvas>
        </div>
    );
}
