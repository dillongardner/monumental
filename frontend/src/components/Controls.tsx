export default function Controls({ sendCommand }) {
    return (
        <div>
            <button onClick={() => sendCommand({ swing_rotation: 30 })}>Rotate</button>
            <button onClick={() => sendCommand({ lift_elevation: 600 })}>Lift</button>
        </div>
    );
}
