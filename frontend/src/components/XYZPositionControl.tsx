import React, { useState } from 'react';
import { XYZPositionTarget } from '../types/messages';

interface XYZPositionControlProps {
    onPositionSubmit: (position: XYZPositionTarget) => void;
}

const XYZPositionControl: React.FC<XYZPositionControlProps> = ({ onPositionSubmit }) => {
    const [position, setPosition] = useState<XYZPositionTarget>({
        x: 0,
        y: 0,
        z: 0
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onPositionSubmit(position);
    };

    const handleChange = (field: keyof XYZPositionTarget) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setPosition(prev => ({
            ...prev,
            [field]: parseFloat(e.target.value)
        }));
    };

    return (
        <div className="xyz-position-control">
            <h2>Move Crane To XYZ</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        X Position:
                        <input
                            type="number"
                            value={position.x}
                            onChange={handleChange('x')}
                            step="0.1"
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Y Position:
                        <input
                            type="number"
                            value={position.y}
                            onChange={handleChange('y')}
                            step="0.1"
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Z Position:
                        <input
                            type="number"
                            value={position.z}
                            onChange={handleChange('z')}
                            step="0.1"
                        />
                    </label>
                </div>
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default XYZPositionControl; 