import { useEffect, useState, useRef } from "react";
import { WebSocketMessage, Response, Status } from "../types/messages";
import { CraneState } from "../types/crane";

const DEFAULT_CRANE_STATE: CraneState = {
    swing: 0,
    lift: 1,
    elbow: 0,
    wrist: 0,
    gripper: 0
};

export default function useWebSocket() {
    const [craneState, setCraneState] = useState<CraneState>(DEFAULT_CRANE_STATE);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [status, setStatus] = useState<Status>(Status.STOPPED);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        wsRef.current = new WebSocket("ws://localhost:8000/ws");
        
        wsRef.current.onmessage = (event) => {
            console.log("Received message:", event.data);
            try {
                const data: Response = JSON.parse(event.data);
                
                if (data.status === Status.ERROR) {
                    setErrorMessage(data.errorMessage || "The request failed with missing message");
                    return;
                }
                
                setErrorMessage(null);
                setStatus(data.status);
                const newCraneState = data.craneState;
                
                // Validate the received data matches our CraneState type
                if (
                    typeof newCraneState?.lift === 'number' &&
                    typeof newCraneState?.swing === 'number' &&
                    typeof newCraneState?.elbow === 'number' &&
                    typeof newCraneState?.wrist === 'number' &&
                    typeof newCraneState?.gripper === 'number'
                ) {
                    setCraneState(newCraneState);
                } else {
                    console.error("Invalid data structure:", newCraneState);
                }
            } catch (error) {
                console.error("Error parsing JSON:", error);
                setErrorMessage("Error processing server response");
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

    return { craneState, sendCommand, errorMessage, status };
}
