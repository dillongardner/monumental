from dataclasses import dataclass

@dataclass
class CraneState:
    swing_rotation: float  # degrees
    lift_elevation: float  # mm
    elbow_rotation: float  # degrees
    wrist_rotation: float  # degrees
    gripper: float  # mm (open/close)

    def update_state(self, new_state: dict):
        for key, value in new_state.items():
            setattr(self, key, value)
