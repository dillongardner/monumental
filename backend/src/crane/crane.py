from dataclasses import dataclass, field


@dataclass
class CraneState:
    swing: float  # degrees
    lift: float  # mm
    elbow: float  # degrees
    wrist: float  # degrees
    gripper: float  # mm (open/close)

    def update_state(self, new_state: dict):
        for key, value in new_state.items():
            setattr(self, key, value)

@dataclass
class CraneSpeeds:
    swing: float = 10  # degrees/sec
    lift: float  = 0.1# m/sec
    elbow: float = 10  # degrees/sec
    wrist: float = 10  # degrees/sec
    gripper: float  = 0.05 # m/sec    


@dataclass
class Cylinder:
    radius: float = 1
    height: float = 1
    segment: float = 32


@dataclass
class Box:
    width: float = 1 
    height: float = 1
    depth: float = 1   


@dataclass
class CraneOrientation:
    x: float = 0
    y: float = 0   
    z: float = 0
    y_rotation: float = 0


@dataclass
class Crane:
    # TODO: a crane also needs to have maximum extents for each motor
    max_speeds: CraneSpeeds = field(default_factory=CraneSpeeds)
    column: Box = field(default_factory=Box)
    elbow: Box = field(default_factory=Box)
    wrist: Box = field(default_factory=Box)
    gripper: Box = field(default_factory=Box)
    orientation: CraneOrientation = field(default_factory=CraneOrientation)

    def is_valid_state(self, state: CraneState) -> bool:
        # TODO: Add real check to see if state is valid for crane
        return True

