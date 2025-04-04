import { CraneOrientation, XYZPosition, CraneState } from './crane';

export type MessageType = 'crane_state' | 'xyz_position';
export enum Status {
    MOVING = 'moving',
    STOPPED = 'stopped',
    ERROR = 'error'
}

export interface BaseMessage {
    type: MessageType;
    orientation: CraneOrientation;
}

export interface CraneStateMessage extends BaseMessage {
    type: 'crane_state';
    target: CraneState;
}

export interface XYZPositionMessage extends BaseMessage {
    type: 'xyz_position';
    target: XYZPosition;
}

export type WebSocketMessage = CraneStateMessage | XYZPositionMessage;

export interface Response {
    craneState?: CraneState;
    xyzPosition?: XYZPosition;
    targetState?: CraneState;
    targetXyzPostion?: XYZPosition;
    status: Status;
    errorMessage?: string;
} 