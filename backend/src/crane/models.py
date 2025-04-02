from enum import Enum
from pydantic import BaseModel


class CraneOrientation(BaseModel):
    x: float = 0
    y: float = 0 
    z: float = 0
    rotationZ: float = 0


class SwingLiftElbow(BaseModel):
    swing: float
    lift: float
    elbow: float


class CraneMotors(SwingLiftElbow):
    wrist: float
    gripper: float


class CraneSpeeds(CraneMotors): 
    pass


class CraneState(CraneMotors):
    pass


class XYZPosition(BaseModel):
    x: float
    y: float
    z: float


class MessageType(str, Enum):
    CRANE_STATE = "crane_state"
    XYZ_POSITION = "xyz_position"


class BaseMessage(BaseModel):
    type: MessageType
    orientation: CraneOrientation


class CraneStateMessage(BaseMessage):
    type: MessageType = MessageType.CRANE_STATE
    target: CraneState


class XYZPositionMessage(BaseMessage):
    type: MessageType = MessageType.XYZ_POSITION
    target: XYZPosition

