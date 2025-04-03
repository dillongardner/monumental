import React, { useEffect } from 'react';
import { CraneStateMessage, CraneStateTarget } from '../types/messages';

interface ControlsProps {
    sendCommand: (message: CraneStateMessage) => void;
    currentState?: CraneStateTarget;
}

export default function MotorControls({ sendCommand, currentState }: ControlsProps) {
    const [motors, setValues] = React.useState<CraneStateTarget>({
        swing: 0,
        lift: 1,
        elbow: 0,
        wrist: 0,
        gripper: 0
    });
    
    // Keep track of previous state for reset functionality
    const [previousValues, setPreviousValues] = React.useState<CraneStateTarget>({...motors});

    // Update motors when currentState changes
    useEffect(() => {
        if (currentState) {
            setValues(currentState);
        }
    }, [currentState]);

    const handleChange = (key: keyof CraneStateTarget, value: string, parser: (value: string) => number) => {
        const parsedValue = parser(value);
        setValues(prev => ({ ...prev, [key]: parsedValue }));
    };

    const handleSend = () => {
        setPreviousValues({...motors});
        sendCommand({
            type: 'crane_state',
            target: motors,
            orientation: { x: 0, y: 0, z: 0, rotationZ: 0 } // This will be overridden by the parent
        });
    };

    const handleReset = () => {
        setValues({...previousValues});
    };

    return (
        <div className="motor-controls-container">
            <h2>Motor Controls</h2>
            <div>
                <label>Swing: </label>
                <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    value={motors.swing}
                    onChange={(e) => handleChange('swing', e.target.value, parseInt)}
                />
                <span>{motors.swing.toFixed(1)}°</span>
            </div>
            <div>
                <label>Lift: </label>
                <input 
                    type="range" 
                    min="0" 
                    max="3" 
                    step="0.1"
                    value={motors.lift}
                    onChange={(e) => handleChange('lift', e.target.value, parseFloat)}
                />
                <span>{motors.lift.toFixed(1)}</span>
            </div>
            <div>
                <label>Elbow: </label>
                <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    value={motors.elbow}
                    onChange={(e) => handleChange('elbow', e.target.value, parseInt)}
                />
                <span>{motors.elbow.toFixed(1)}°</span>
            </div>
            <div>
                <label>Wrist: </label>
                <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    value={motors.wrist}
                    onChange={(e) => handleChange('wrist', e.target.value, parseInt)}
                />
                <span>{motors.wrist.toFixed(1)}°</span>
            </div>
            <div>
                <label>Gripper: </label>
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1"
                    value={motors.gripper}
                    onChange={(e) => handleChange('gripper', e.target.value, parseFloat)}
                />
                <span>{motors.gripper.toFixed(1)}</span>
            </div>
            <div style={{ marginTop: '20px' }}>
                <button onClick={handleSend}>Send</button>
                <button onClick={handleReset}>Reset</button>
            </div>
        </div>
    );
}
