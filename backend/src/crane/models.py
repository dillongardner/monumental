from enum import Enum
from typing import Optional
from pydantic import BaseModel

class CraneOrientation(BaseModel):
    x: float = 0
    y: float = 0 
    z: float = 0
    rotationZ: float = 0 # in degrees


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


class Cylinder(BaseModel):
    radius: float = 1
    height: float = 1
    segment: float = 32


class Box(BaseModel):
    width: float = 1
    height: float = 1
    depth: float = 1


class Crane(BaseModel):
    # TODO: a crane also needs to have maximum extents for each motor
    max_speeds: CraneSpeeds
    base: Cylinder
    column: Box
    upper_arm: Box
    upper_spacer: Cylinder
    lower_arm: Box
    lower_spacer: Cylinder
    gripper: Box


# TODO: this should be used to initialize the frontend crane dimensions
# This needs to be kept in sync with the Crane.tsx dimensions
DEFAULT_CRANE = Crane(
    max_speeds=CraneSpeeds(
        swing=10,
        lift=0.2,
        elbow=10,
        wrist=10,
        gripper=0.1,
    ),
    base=Cylinder(radius=0.5, height=0.4, segment=32),
    column=Box(width=0.3, height=3, depth=0.3),
    upper_arm=Box(width=1, height=0.3, depth=0.2),
    upper_spacer=Cylinder(radius=0.15, height=0.2, segment=32),
    lower_arm=Box(width=1, height=0.15, depth=0.15),
    lower_spacer=Cylinder(radius=0.1, height=0.3, segment=32),
    gripper=Box(width=0.5, height=0.1, depth=0.1),
)


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

class Response(BaseModel):
    craneState: Optional[CraneState] = None
    xyzPosition: Optional[XYZPosition] = None
    targetState: Optional[CraneState] = None
    targetXyzPostion: Optional[XYZPosition] = None
    errorMessage: Optional[str] = None
    success: bool
