import React, { useState } from 'react';
import { CraneOrientation, XYZPosition } from '../types/crane';

interface OrientationControlsProps {
    onOrientationChange: (orientation: CraneOrientation, targetPosition: XYZPosition) => void;
    targetPosition: XYZPosition;
}

const OrientationControls: React.FC<OrientationControlsProps> = ({ onOrientationChange, targetPosition }) => {
    const [orientation, setOrientation] = useState<CraneOrientation>({
        x: 0,
        y: 0,
        z: 0,
        rotationZ: 0
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onOrientationChange(orientation, targetPosition);
    };

    const handleChange = (field: keyof CraneOrientation) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setOrientation(prev => ({
            ...prev,
            [field]: parseFloat(e.target.value)
        }));
    };

    return (
        <div className="orientation-controls">
            <h2>Crane Origin</h2>
            <h5>When sent, will also move the crane to XYZ Position</h5>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        X Position:
                        <input
                            type="number"
                            value={orientation.x}
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
                            value={orientation.y}
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
                            value={orientation.z}
                            onChange={handleChange('z')}
                            step="0.1"
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Z Rotation (degrees):
                        <input
                            type="number"
                            value={orientation.rotationZ}
                            onChange={handleChange('rotationZ')}
                            step="1"
                        />
                    </label>
                </div>
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default OrientationControls; 