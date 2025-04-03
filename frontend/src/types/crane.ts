export interface XYZPosition {
    x: number;
    y: number;
    z: number;
}

export interface CraneOrientation extends XYZPosition {
    rotationZ: number;
}

export interface CraneState {
    swing: number;
    lift: number;
    elbow: number;
    wrist: number;
    gripper: number;
} 