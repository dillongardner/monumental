from dataclasses import dataclass, field
import math
from typing import Optional, Tuple
import logging
import numpy as np
from crane.messages import XYZPositionTarget

logger = logging.getLogger(__name__)


@dataclass
class SwingLiftElbow:
    swing: float
    lift: float
    elbow: float


@dataclass
class CraneState(SwingLiftElbow):
    swing: float  # degrees
    lift: float
    elbow: float  # degrees
    wrist: float  # degrees
    gripper: float

    def update_state(self, new_state: dict):
        for key, value in new_state.items():
            setattr(self, key, value)


@dataclass
class CraneSpeeds:
    swing: float = 10  # degrees/sec
    lift: float = 0.1  # m/sec
    elbow: float = 10  # degrees/sec
    wrist: float = 10  # degrees/sec
    gripper: float = 0.05  # m/sec


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
    upper_arm: Cylinder = field(default_factory=Cylinder)
    wrist: Box = field(default_factory=Box)
    lower_arm: Cylinder = field(default_factory=Cylinder)
    gripper: Box = field(default_factory=Box)
    orientation: CraneOrientation = field(default_factory=CraneOrientation)

    def is_valid_state(self, state: CraneState) -> bool:
        # TODO: Add real check to see if state is valid for crane
        return True

    def xyz_to_swing_lift_elbow(
        self, xyz: XYZPositionTarget
    ) -> Optional[SwingLiftElbow]:
        """
        Convert an xyz position to the necessary lift, swing, and elbow

        The y values are trivial as no rotations impact the y position.
        The x and z values are a two-link planar arm.
        See for example https://opentextbooks.clemson.edu/wangrobotics/chapter/inverse-kinematics/
        Be aware that when solvable, there are two solutions, corresponding to the elbow up and elbow down configurations.
        This solution is the elbow down solution with notation following the above reference
        """
        try:
            if xyz.x**2 + xyz.z**2 > (self.elbow.width + self.wrist.width) ** 2:
                logger.warning("Target is out of reach")
                return None
            lift = xyz.y + self.upper_arm.height + self.lower_arm.height

            r = (xyz.x**2 + xyz.z**2) ** 0.5
            # Note: there is an additional negative sign here to account for the rotations being left-handed when looking in the x-z plane
            phi_3 = math.atan2(-xyz.z, xyz.x) * 180 / math.pi
            _numerator_1 = self.elbow.width**2 + r**2 - self.wrist.width**2
            _denominator_2 = 2 * self.elbow.width * r
            phi_1 = math.acos(_numerator_1 / _denominator_2) * 180 / math.pi
            swing = phi_3 - phi_1

            _numerator_2 = self.elbow.width**2 + self.wrist.width**2 - r**2
            _denominator_2 = 2 * self.elbow.width * self.wrist.width
            phi_2 = math.acos(_numerator_2 / _denominator_2) * 180 / math.pi
            elbow = 180 - phi_2
        except ValueError:
            logger.error(
                "Invalid state - this should never happen and suggests calculations are wrong"
            )
            return None
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return None
        return SwingLiftElbow(swing, lift, elbow)

    def swing_lift_elbow_to_xyz(self, state: SwingLiftElbow) -> XYZPositionTarget:
        def cos(angle_degrees: float) -> float:
            return np.cos(angle_degrees * np.pi / 180)

        def sin(angle_degrees: float) -> float:
            return np.sin(angle_degrees * np.pi / 180)

        mat_lift = np.array(
            [
                [1, 0, 0, 0],
                [0, 1, 0, state.lift - self.upper_arm.height - self.lower_arm.height],
                [0, 0, 1, 0],
                [0, 0, 0, 1],
            ]
        )

        mat_swing = np.array(
            [
                [
                    cos(state.swing),
                    0,
                    sin(state.swing),
                    cos(state.swing) * self.elbow.width,
                ],
                [0, 1, 0, 0],
                [
                    -sin(state.swing),
                    0,
                    cos(state.swing),
                    -sin(state.swing) * self.elbow.width,
                ],
                [0, 0, 0, 1],
            ]
        )
        mat_elbow = np.array(
            [
                [
                    cos(state.elbow),
                    0,
                    sin(state.elbow),
                    cos(state.elbow) * self.elbow.width,
                ],
                [0, 1, 0, 0],
                [
                    -sin(state.elbow),
                    0,
                    cos(state.elbow),
                    -sin(state.elbow) * self.elbow.width,
                ],
                [0, 0, 0, 1],
            ]
        )
        full_matrix = mat_lift @ mat_swing @ mat_elbow
        return XYZPositionTarget(
            x=full_matrix[0, -1], y=full_matrix[1, -1], z=full_matrix[2, -1]
        )


DEFAULT_CRANE = Crane(
    column=Box(width=0.3, height=3, depth=0.3),
    elbow=Box(width=1, height=0.3, depth=0.2),
    upper_arm=Cylinder(radius=0.15, height=0.5, segment=32),
    wrist=Box(width=1, height=0.15, depth=0.15),
    lower_arm=Cylinder(radius=0.1, height=0.5, segment=32),
    gripper=Box(width=0.5, height=0.1, depth=0.1),
)
