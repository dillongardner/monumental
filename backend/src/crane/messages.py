from enum import Enum
from pydantic import BaseModel

class MessageType(str, Enum):
    CRANE_STATE = "crane_state"
    XYZ_POSITION = "xyz_position"

class BaseMessage(BaseModel):
    type: MessageType

class CraneStateTarget(BaseModel):
    swing: float
    lift: float
    elbow: float
    wrist: float
    gripper: float

class XYZPositionTarget(BaseModel):
    x: float
    y: float
    z: float

class CraneStateMessage(BaseMessage):
    type: MessageType = MessageType.CRANE_STATE
    target: CraneStateTarget

class XYZPositionMessage(BaseMessage):
    type: MessageType = MessageType.XYZ_POSITION
    target: XYZPositionTarget
