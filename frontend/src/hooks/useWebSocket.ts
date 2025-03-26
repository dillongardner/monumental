import { useEffect, useState } from "react";

export default function useWebSocket() {
    const [craneState, setCraneState] = useState(null);
    const [ws, setWs] = useState(null);

    useEffect(() => {
        const wsConnection = new WebSocket("ws://localhost:8000/ws");
        setWs(wsConnection);
        
        wsConnection.onmessage = (event) => {
            console.log("Received message:", event.data);
            try {
                const data = JSON.parse(event.data);
                
                // Basic validation (you can expand this as needed)
                if (
                    typeof data.lift === 'number' &&
                    typeof data.swing === 'number' &&
                    typeof data.elbow === 'number' &&
                    typeof data.wrist === 'number' &&
                    typeof data.gripper === 'number'
                ) {
                    setCraneState(data);
                } else {
                    console.error("Invalid data structure:", data);
                }
            } catch (error) {
                console.error("Error parsing JSON:", error);
            }
        };
        
        return () => wsConnection.close();
    }, []);

    const sendCommand = (values) => {
        console.log("Sending command:", values);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                target: values
            }));
        }
    };

    return { craneState, sendCommand };
}
