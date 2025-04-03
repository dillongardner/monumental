import { CraneOrientation } from './crane';

export type MessageType = 'crane_state' | 'xyz_position';

export interface BaseMessage {
    type: MessageType;
    orientation: CraneOrientation;
}

export interface CraneStateTarget {
    swing: number;
    lift: number;
    elbow: number;
    wrist: number;
    gripper: number;
}

export interface XYZPositionTarget {
    x: number;
    y: number;
    z: number;
}

export interface CraneStateMessage extends BaseMessage {
    type: 'crane_state';
    target: CraneStateTarget;
}

export interface XYZPositionMessage extends BaseMessage {
    type: 'xyz_position';
    target: XYZPositionTarget;
}

export type WebSocketMessage = CraneStateMessage | XYZPositionMessage;

export interface Response {
    craneState?: CraneStateTarget;
    xyzPosition?: XYZPositionTarget;
    targetState?: CraneStateTarget;
    targetXyzPostion?: XYZPositionTarget;
    success: boolean;
    errorMessage?: string;
} 