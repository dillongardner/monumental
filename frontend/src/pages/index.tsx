import useWebSocket from "../hooks/useWebSocket";
import Crane from "../threejs/Crane";
import Controls from "../components/Controls";

export default function Home() {
    const { craneState } = useWebSocket();

    return (
        <div>
            <h1>Crane Simulator</h1>
            <Controls sendCommand={(cmd) => {/* WebSocket send logic */}} />
            <Crane state={craneState} />
        </div>
    );
}
