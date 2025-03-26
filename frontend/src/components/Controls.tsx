import React from 'react';

export default function Controls({ sendCommand }) {
    const [values, setValues] = React.useState({
        swing: 0,
        lift: 1,
        elbow: 0,
        wrist: 0,
        gripper: 0
    });
    
    // Keep track of previous state for reset functionality
    const [previousValues, setPreviousValues] = React.useState({...values});

    const handleChange = (key, value, parser) => {
        const parsedValue = parser(value);
        setValues(prev => ({ ...prev, [key]: parsedValue }));
    };

    const handleSend = () => {
        setPreviousValues({...values});
        sendCommand(values);
    };

    const handleReset = () => {
        setValues({...previousValues});
    };

    return (
        <div>
            <div>
                <label>Swing: </label>
                <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    value={values.swing}
                    onChange={(e) => handleChange('swing', e.target.value, parseInt)}
                />
                <span>{values.swing}°</span>
            </div>
            <div>
                <label>Lift: </label>
                <input 
                    type="range" 
                    min="0" 
                    max="3" 
                    step="0.1"
                    value={values.lift}
                    onChange={(e) => handleChange('lift', e.target.value, parseFloat)}
                />
                <span>{values.lift}</span>
            </div>
            <div>
                <label>Elbow: </label>
                <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    value={values.elbow}
                    onChange={(e) => handleChange('elbow', e.target.value, parseInt)}
                />
                <span>{values.elbow}°</span>
            </div>
            <div>
                <label>Wrist: </label>
                <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    value={values.wrist}
                    onChange={(e) => handleChange('wrist', e.target.value, parseInt)}
                />
                <span>{values.wrist}°</span>
            </div>
            <div>
                <label>Gripper: </label>
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1"
                    value={values.gripper}
                    onChange={(e) => handleChange('gripper', e.target.value, parseFloat)}
                />
                <span>{values.gripper}</span>
            </div>
            <div style={{ marginTop: '20px' }}>
                <button onClick={handleSend}>Send</button>
                <button onClick={handleReset}>Reset</button>
            </div>
        </div>
    );
}
