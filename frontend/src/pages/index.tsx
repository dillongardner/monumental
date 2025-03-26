import useWebSocket from "../hooks/useWebSocket";
import Crane from "../threejs/Crane";
import Controls from "../components/Controls";

export default function Home() {
    const { craneState, sendCommand } = useWebSocket();

    return (
        <div>
            <h1>Crane Simulator</h1>
            <Controls sendCommand={sendCommand} />
            <Crane craneState={craneState} />
        </div>
    );
}
