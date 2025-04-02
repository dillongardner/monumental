import useWebSocket from "../hooks/useWebSocket";
import Crane from "../threejs/Crane";
import MotorControls from "../components/MotorControls";
import OrientationControls from "../components/OrientationControls";
import XYZPositionControl from "../components/XYZPositionControl";
import { useState } from "react";
import { CraneOrientation } from "../types/crane";
import { XYZPositionTarget, CraneStateMessage } from "../types/messages";

export default function Page() {
    const { craneState, sendCommand } = useWebSocket();
    const [orientation, setOrientation] = useState<CraneOrientation>({
        x: 0,
        y: 0,
        z: 0,
        rotationZ: 0
    });
    const [targetPosition, setTargetPosition] = useState<XYZPositionTarget | null>(null);

    const handleOrientationChange = (newOrientation: CraneOrientation, currentTargetPosition: XYZPositionTarget | null) => {
        setOrientation(newOrientation);
        if (currentTargetPosition) {
            sendCommand({
                type: 'xyz_position',
                target: currentTargetPosition,
                orientation: newOrientation
            });
        }
    };

    const handleXYZPositionSubmit = (position: XYZPositionTarget) => {
        setTargetPosition(position);
        sendCommand({
            type: 'xyz_position',
            target: position,
            orientation: orientation
        });
    };

    const handleControlsSubmit = (message: CraneStateMessage) => {
        sendCommand({
            type: 'crane_state',
            target: message.target,
            orientation: orientation
        });
    };

    return (
        <div>
            <h1>Crane Simulator</h1>
            <div style={{ display: 'flex', gap: '20px' }}>
                <MotorControls sendCommand={handleControlsSubmit} />
                <XYZPositionControl onPositionSubmit={handleXYZPositionSubmit} />
                <OrientationControls 
                    onOrientationChange={handleOrientationChange} 
                    targetPosition={targetPosition}
                />
            </div>
            <Crane 
                craneState={craneState} 
                orientation={orientation} 
                targetPosition={targetPosition}
            />
        </div>
    );
}
