import React from 'react';

export interface FormField {
    label: string;
    value: number;
    onChange: (value: number) => void;
    type?: 'number' | 'range';
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
}

interface FormControlsProps {
    title: string;
    fields: FormField[];
    onSubmit: () => void;
    onReset?: () => void;
    showReset?: boolean;
}

const FormControls: React.FC<FormControlsProps> = ({
    title,
    fields,
    onSubmit,
    onReset,
    showReset = false
}) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <div className="form-controls">
            <h2>{title}</h2>
            <form onSubmit={handleSubmit}>
                {fields.map((field, index) => (
                    <div key={index}>
                        <label>
                            {field.label}:
                            {field.type === 'range' ? (
                                <>
                                    <input
                                        type="range"
                                        min={field.min}
                                        max={field.max}
                                        step={field.step}
                                        value={field.value}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    />
                                    <span>{field.value.toFixed(1)}{field.unit}</span>
                                </>
                            ) : (
                                <input
                                    type="number"
                                    value={field.value}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    step={field.step || 0.1}
                                />
                            )}
                        </label>
                    </div>
                ))}
                <div style={{ marginTop: '20px' }}>
                    <button type="submit">Send</button>
                    {showReset && onReset && (
                        <button type="button" onClick={onReset}>Reset</button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default FormControls; 