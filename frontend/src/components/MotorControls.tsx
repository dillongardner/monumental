import React, { useEffect } from 'react';
import { CraneStateMessage } from '../types/messages';
import { CraneState } from '../types/crane';
import FormControls, { FormField } from './FormControls';

interface ControlsProps {
    sendCommand: (message: CraneStateMessage) => void;
    currentState?: CraneState;
}

export default function MotorControls({ sendCommand, currentState }: ControlsProps) {
    const [motors, setValues] = React.useState<CraneState>({
        swing: 0,
        lift: 1,
        elbow: 0,
        wrist: 0,
        gripper: 0
    });
    
    // Keep track of previous state for reset functionality
    const [previousValues, setPreviousValues] = React.useState<CraneState>({...motors});

    // Update motors when currentState changes
    useEffect(() => {
        if (currentState) {
            setValues(currentState);
        }
    }, [currentState]);

    const handleChange = (key: keyof CraneState) => (value: number) => {
        setValues(prev => ({ ...prev, [key]: value }));
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

    const fields: FormField[] = [
        {
            label: 'Swing',
            value: motors.swing,
            onChange: handleChange('swing'),
            type: 'range',
            min: -180,
            max: 180,
            unit: '°'
        },
        {
            label: 'Lift',
            value: motors.lift,
            onChange: handleChange('lift'),
            type: 'range',
            min: 0,
            max: 3,
            step: 0.1
        },
        {
            label: 'Elbow',
            value: motors.elbow,
            onChange: handleChange('elbow'),
            type: 'range',
            min: -180,
            max: 180,
            unit: '°'
        },
        {
            label: 'Wrist',
            value: motors.wrist,
            onChange: handleChange('wrist'),
            type: 'range',
            min: -180,
            max: 180,
            unit: '°'
        },
        {
            label: 'Gripper',
            value: motors.gripper,
            onChange: handleChange('gripper'),
            type: 'range',
            min: 0,
            max: 0.5
            ,
            step: 0.1
        }
    ];

    return (
        <FormControls
            title="Motor Controls"
            fields={fields}
            onSubmit={handleSend}
            onReset={handleReset}
            showReset={true}
        />
    );
}
