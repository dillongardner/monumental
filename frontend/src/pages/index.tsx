import useWebSocket from "../hooks/useWebSocket";
import Crane from "../threejs/Crane";
import Controls from "../components/Controls";
import OrientationControls from "../components/OrientationControls";
import { useState } from "react";
import { CraneOrientation } from "../types/crane";

export default function Home() {
    const { craneState, sendCommand } = useWebSocket();
    const [orientation, setOrientation] = useState<CraneOrientation>({
        x: 0,
        y: 0,
        z: 0,
        rotationZ: 0
    });

    const handleOrientationChange = (newOrientation: CraneOrientation) => {
        setOrientation(newOrientation);
        // Here you would typically also send the orientation update to the backend
        // sendCommand({ type: 'update_orientation', orientation: newOrientation });
    };

    return (
        <div>
            <h1>Crane Simulator</h1>
            <div style={{ display: 'flex', gap: '20px' }}>
                <Controls sendCommand={sendCommand} />
                <OrientationControls onOrientationChange={handleOrientationChange} />
            </div>
            <Crane craneState={craneState} orientation={orientation} />
        </div>
    );
}
