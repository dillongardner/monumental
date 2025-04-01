import useWebSocket from "../hooks/useWebSocket";
import Crane from "../threejs/Crane";
import Controls from "../components/Controls";
import OrientationControls from "../components/OrientationControls";
import XYZPositionControl from "../components/XYZPositionControl";
import { useState } from "react";
import { CraneOrientation } from "../types/crane";
import { XYZPositionTarget } from "../types/messages";

export default function Home() {
    const { craneState, sendCommand } = useWebSocket();
    const [orientation, setOrientation] = useState<CraneOrientation>({
        x: 0,
        y: 0,
        z: 0,
        rotationZ: 0
    });
    const [targetPosition, setTargetPosition] = useState<XYZPositionTarget | null>(null);

    const handleOrientationChange = (newOrientation: CraneOrientation) => {
        setOrientation(newOrientation);
        // Here you would typically also send the orientation update to the backend
        // sendCommand({ type: 'update_orientation', orientation: newOrientation });
    };

    const handleXYZPositionSubmit = (position: XYZPositionTarget) => {
        setTargetPosition(position);
        sendCommand({
            type: 'xyz_position',
            target: position
        });
    };

    return (
        <div>
            <h1>Crane Simulator</h1>
            <div style={{ display: 'flex', gap: '20px' }}>
                <Controls sendCommand={sendCommand} />
                <OrientationControls onOrientationChange={handleOrientationChange} />
                <XYZPositionControl onPositionSubmit={handleXYZPositionSubmit} />
            </div>
            <Crane 
                craneState={craneState} 
                orientation={orientation} 
                targetPosition={targetPosition}
            />
        </div>
    );
}
