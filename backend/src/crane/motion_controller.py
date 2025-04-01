import asyncio
import math
from crane.crane import CraneState, Crane
from typing import Callable, Awaitable, Optional

import logging

from crane.messages import XYZPositionTarget

logger = logging.getLogger(__name__)


class MotionController:
    def __init__(self, state: CraneState, crane: Crane):
        self.state = state
        self.max_speeds = {
            "swing": 10,  # degrees/sec
            "lift": 0.5,  # mm/sec
            "elbow": 15,  # degrees/sec
            "wrist": 20,  # degrees/sec
            "gripper": 5,  # mm/sec
        }
        self.crane = crane
        self._current_task: Optional[asyncio.Task] = None
        self._motion_lock = asyncio.Lock()

    async def _execute_motion(
        self,
        target_state: CraneState,
        max_duration: float = 30.0,
        on_update: Optional[Callable[[CraneState], Awaitable[None]]] = None,
    ):
        """Internal method to execute the motion asynchronously."""
        if not self.crane.is_valid_state(target_state):
            logger.error("Invalid target state")
            return

        start_time = asyncio.get_event_loop().time()

        while asyncio.get_event_loop().time() - start_time < max_duration:
            async with self._motion_lock:
                for key in self.max_speeds:
                    step = self.max_speeds[key] * 0.1  # Adjust per tick
                    current = getattr(self.state, key)
                    target = getattr(target_state, key)

                    if abs(target - current) > step:
                        logger.debug(
                            f"Moving {key} from {current} to {current + step if target > current else current - step}"
                        )
                        setattr(
                            self.state,
                            key,
                            current + step if target > current else current - step,
                        )
                    else:
                        setattr(self.state, key, target)

                if on_update:
                    await on_update(self.state)
                # Check if we've reached the target state
                if all(
                    getattr(self.state, key) == getattr(target_state, key)
                    for key in self.max_speeds
                ):
                    logger.info("Reached target state")
                    break
            await asyncio.sleep(0.1)

    async def apply_motion(
        self,
        target_state: CraneState,
        max_duration: float = 30.0,
        on_update: Optional[Callable[[CraneState], Awaitable[None]]] = None,
    ):
        """Smoothly transitions to target state over a duration asynchronously."""
        # Cancel any ongoing motion
        if self._current_task and not self._current_task.done():
            self._current_task.cancel()
            try:
                await self._current_task
            except asyncio.CancelledError:
                pass

        # Create and start new motion task
        self._current_task = asyncio.create_task(
            self._execute_motion(target_state, max_duration, on_update)
        )
        return self._current_task

    def xyz_to_crane_state(self, xyz: XYZPositionTarget) -> Optional[CraneState]:
        """
        Convert an xyz position to a crane state

        The y values are trivial as no rotations impact the y position.
        The x and z values are a two-link planar arm.
        See for example https://opentextbooks.clemson.edu/wangrobotics/chapter/inverse-kinematics/
        Be aware that when solvable, there are two solutions, corresponding to the elbow up and elbow down configurations.
        This solution is the elbow down solution.
        """
        try:
            if (
                xyz.x**2 + xyz.z**2
                < (self.crane.elbow.width + self.crane.wrist.width) ** 2
            ):
                logger.warning("Target is out of reach")
                return None
            lift = xyz.y + self.crane.upper_arm.height + self.crane.lower_arm.height
            r = (xyz.x**2 + xyz.z**2) ** 0.5
            theta = (
                math.atan2(xyz.z, xyz.x) * 180 / math.pi
            )  # Angle is the sum of the elbow and wrist angles
            _numerator = self.crane.elbow.width**2 + r**2 - self.crane.wrist.width**2
            _denominator = 2 * self.crane.elbow.width * r
            swing = math.acos(_numerator / _denominator) * 180 / math.pi
            elbow = theta - swing
        except ValueError:
            logger.error(
                "Invalid state - this should never happen and suggests calculations are wrong"
            )
            return None
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return None
        return CraneState(swing, lift, elbow, self.state.wrist, self.state.gripper)

    def _rotation_matrix(self, angle: float):
        pass

    def crane_state_to_xyz(self, state: CraneState) -> XYZPositionTarget:
        y = state.lift - self.crane.upper_arm.height - self.crane.lower_arm.height
