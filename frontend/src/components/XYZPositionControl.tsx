import React, { useState } from 'react';
import { XYZPosition } from '../types/crane';
import FormControls, { FormField } from './FormControls';

interface XYZPositionControlProps {
    onPositionSubmit: (position: XYZPosition) => void;
}

const XYZPositionControl: React.FC<XYZPositionControlProps> = ({ onPositionSubmit }) => {
    const [position, setPosition] = useState<XYZPosition>({
        x: 0,
        y: 0,
        z: 0
    });

    const handleChange = (field: keyof XYZPosition) => (value: number) => {
        setPosition(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const fields: FormField[] = [
        { label: 'X Position', value: position.x, onChange: handleChange('x') },
        { label: 'Y Position', value: position.y, onChange: handleChange('y') },
        { label: 'Z Position', value: position.z, onChange: handleChange('z') }
    ];

    return (
        <FormControls
            title="XYZ Controls"
            fields={fields}
            onSubmit={() => onPositionSubmit(position)}
        />
    );
};

export default XYZPositionControl; 