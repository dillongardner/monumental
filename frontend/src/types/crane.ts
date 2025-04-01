export interface CraneOrientation {
    x: number;
    y: number;
    z: number;
    rotationZ: number;
}

export interface CraneState {
    lift: number;
    swing: number;
    elbow: number;
    wrist: number;
    gripper: number;
} 