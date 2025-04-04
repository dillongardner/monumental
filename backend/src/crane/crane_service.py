import math
from typing import Optional
import logging
import numpy as np
from crane.models import (
    CraneOrientation,
    XYZPosition,
    SwingLiftElbow,
    CraneState,
    Crane,
    DEFAULT_CRANE,
)

logger = logging.getLogger(__name__)


class CraneService:
    @staticmethod
    def is_valid_state(state: CraneState, crane: Optional[Crane] = None) -> bool:
        # TODO: Add real check to see if state is valid for crane
        return True

    @staticmethod
    def orientation_to_matrix(orientation: CraneOrientation) -> np.ndarray:
        theta = orientation.rotationZ * np.pi / 180
        return np.array(
            [
                [np.cos(theta), -np.sin(theta), 0, orientation.x],
                [np.sin(theta), np.cos(theta), 0, orientation.y],
                [0, 0, 1, orientation.z],
                [0, 0, 0, 1],
            ]
        )

    @staticmethod
    def orientation_to_inverse_matrix(orientation: CraneOrientation) -> np.ndarray:
        theta = orientation.rotationZ * np.pi / 180
        return np.array(
            [
                [
                    np.cos(theta),
                    np.sin(theta),
                    0,
                    -orientation.x * np.cos(theta) - orientation.y * np.sin(theta),
                ],
                [
                    -np.sin(theta),
                    np.cos(theta),
                    0,
                    orientation.x * np.sin(theta) - orientation.y * np.cos(theta),
                ],
                [0, 0, 1, -orientation.z],
                [0, 0, 0, 1],
            ]
        )

    @staticmethod
    def xyz_to_swing_lift_elbow(
        xyz: XYZPosition,
        crane: Optional[Crane] = None,
        orientation: Optional[CraneOrientation] = None,
    ) -> Optional[SwingLiftElbow]:
        """
        Convert an xyz position to the necessary lift, swing, and elbow

        The y values are trivial as no rotations impact the y position.
        The x and z values are a two-link planar arm.
        See for example https://opentextbooks.clemson.edu/wangrobotics/chapter/inverse-kinematics/
        Be aware that when solvable, there are two solutions, corresponding to the elbow up and elbow down configurations.
        This solution is the elbow down solution with notation following the above reference
        """
        crane = crane or DEFAULT_CRANE
        # Handle the orientation of the crane by applying the inverse rotation to the xyz
        if orientation:
            matrix = CraneService.orientation_to_inverse_matrix(orientation)
            xyz_arr = np.array([xyz.x, xyz.y, xyz.z, 1])
            xyz_arr = matrix @ xyz_arr
            xyz = XYZPosition(x=xyz_arr[0], y=xyz_arr[1], z=xyz_arr[2])
        try:
            if (
                xyz.x**2 + xyz.z**2
                > (crane.upper_arm.width + crane.lower_arm.width) ** 2
            ):
                logger.warning("Target is out of reach")
                return None
            lift = xyz.y + crane.upper_spacer.height + crane.lower_spacer.height

            r = (xyz.x**2 + xyz.z**2) ** 0.5
            # Note: there is an additional negative sign here to account for the rotations being left-handed when looking in the x-z plane
            phi_3 = math.atan2(-xyz.z, xyz.x) * 180 / math.pi
            _numerator_1 = crane.upper_arm.width**2 + r**2 - crane.lower_arm.width**2
            _denominator_2 = 2 * crane.upper_arm.width * r
            phi_1 = math.acos(_numerator_1 / _denominator_2) * 180 / math.pi
            swing = phi_3 - phi_1

            _numerator_2 = crane.upper_arm.width**2 + crane.lower_arm.width**2 - r**2
            _denominator_2 = 2 * crane.upper_arm.width * crane.lower_arm.width
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
        return SwingLiftElbow(swing=swing, lift=lift, elbow=elbow)

    @staticmethod
    def swing_lift_elbow_to_xyz(
        state: SwingLiftElbow,
        crane: Optional[Crane] = None,
        orientation: Optional[CraneOrientation] = None,
    ) -> XYZPosition:
        crane = crane or DEFAULT_CRANE

        def cos(angle_degrees: float) -> float:
            return np.cos(angle_degrees * np.pi / 180)

        def sin(angle_degrees: float) -> float:
            return np.sin(angle_degrees * np.pi / 180)

        mat_lift = np.array(
            [
                [1, 0, 0, 0],
                [
                    0,
                    1,
                    0,
                    state.lift - crane.upper_spacer.height - crane.lower_spacer.height,
                ],
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
                    cos(state.swing) * crane.upper_arm.width,
                ],
                [0, 1, 0, 0],
                [
                    -sin(state.swing),
                    0,
                    cos(state.swing),
                    -sin(state.swing) * crane.upper_arm.width,
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
                    cos(state.elbow) * crane.upper_arm.width,
                ],
                [0, 1, 0, 0],
                [
                    -sin(state.elbow),
                    0,
                    cos(state.elbow),
                    -sin(state.elbow) * crane.upper_arm.width,
                ],
                [0, 0, 0, 1],
            ]
        )
        if orientation:
            orientation_matrix = CraneService.orientation_to_matrix(orientation)
            full_matrix = orientation_matrix @ mat_lift @ mat_swing @ mat_elbow
        else:
            full_matrix = mat_lift @ mat_swing @ mat_elbow
        return XYZPosition(
            x=full_matrix[0, -1], y=full_matrix[1, -1], z=full_matrix[2, -1]
        )

    @staticmethod
    def xyz_to_crane_state(
        xyz: XYZPosition,
        current_state: CraneState,
        orientation: CraneOrientation,
        crane: Optional[Crane] = None,
    ) -> Optional[CraneState]:
        swing_lift_elbow = CraneService.xyz_to_swing_lift_elbow(xyz, crane, orientation)
        if swing_lift_elbow is None:
            return None
        return CraneState(
            swing=swing_lift_elbow.swing,
            lift=swing_lift_elbow.lift,
            elbow=swing_lift_elbow.elbow,
            wrist=current_state.wrist,
            gripper=current_state.gripper,
        )
