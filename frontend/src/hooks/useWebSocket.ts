import { useEffect, useState } from "react";

export default function useWebSocket() {
    const [craneState, setCraneState] = useState(null);
    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/ws");
        ws.onmessage = (event) => setCraneState(JSON.parse(event.data));
        return () => ws.close();
    }, []);
    return { craneState };
}
