export default function Controls({ sendCommand }) {
    return (
        <div>
            <div>
                <label>Swing: </label>
                <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    defaultValue="0"
                    onChange={(e) => sendCommand({ swing: parseInt(e.target.value) })}
                />
            </div>
            <div>
                <label>Lift: </label>
                <input 
                    type="range" 
                    min="0" 
                    max="3" 
                    step="0.1"
                    defaultValue="1"
                    onChange={(e) => sendCommand({ lift: parseFloat(e.target.value) })}
                />
            </div>
            <div>
                <label>Elbow: </label>
                <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    defaultValue="0"
                    onChange={(e) => sendCommand({ elbow: parseInt(e.target.value) })}
                />
            </div>
            <div>
                <label>Wrist: </label>
                <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    defaultValue="0"
                    onChange={(e) => sendCommand({ wrist: parseInt(e.target.value) })}
                />
            </div>
            <div>
                <label>Gripper: </label>
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1"
                    defaultValue="0"
                    onChange={(e) => sendCommand({ gripper: parseFloat(e.target.value) })}
                />
            </div>
        </div>
    );
}
