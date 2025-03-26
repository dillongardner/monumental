import { useEffect, useState } from "react";

export default function useWebSocket() {
    const [craneState, setCraneState] = useState(null);
    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/ws");
        ws.onmessage = (event) => {
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
        return () => ws.close();
    }, []);
    return { craneState };
}
