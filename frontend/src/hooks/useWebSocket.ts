import { useEffect, useState, useRef } from "react";
import { WebSocketMessage, CraneStateTarget } from "../types/messages";

const DEFAULT_CRANE_STATE: CraneStateTarget = {
    swing: 0,
    lift: 1,
    elbow: 0,
    wrist: 0,
    gripper: 0
};

export default function useWebSocket() {
    const [craneState, setCraneState] = useState<CraneStateTarget>(DEFAULT_CRANE_STATE);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        wsRef.current = new WebSocket("ws://localhost:8000/ws");
        
        wsRef.current.onmessage = (event) => {
            console.log("Received message:", event.data);
            try {
                const data = JSON.parse(event.data);
                
                // Validate the received data matches our CraneStateTarget type
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
        
        return () => {
            wsRef.current?.close();
        };
    }, []);

    const sendCommand = (message: WebSocketMessage) => {
        console.log("Sending command:", message);
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        }
    };

    return { craneState, sendCommand };
}
