from dataclasses import dataclass

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
