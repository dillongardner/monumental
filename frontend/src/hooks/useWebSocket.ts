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
                const new_crane_state = data.craneState;
                
                // Validate the received data matches our CraneStateTarget type
                if (
                    typeof new_crane_state.lift === 'number' &&
                    typeof new_crane_state.swing === 'number' &&
                    typeof new_crane_state.elbow === 'number' &&
                    typeof new_crane_state.wrist === 'number' &&
                    typeof new_crane_state.gripper === 'number'
                ) {
                    setCraneState(new_crane_state);
                } else {
                    console.error("Invalid data structure:", new_crane_state);
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
