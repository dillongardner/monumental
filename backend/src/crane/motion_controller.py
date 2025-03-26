import asyncio
from crane.crane_state import CraneState
from typing import Callable, Awaitable, Optional

import logging

logger = logging.getLogger(__name__)


class MotionController:
    def __init__(self, state: CraneState):
        self.state = state
        self.max_speeds = {
            "swing": 10,  # degrees/sec
            "lift": 0.05,  # mm/sec
            "elbow": 15,  # degrees/sec
            "wrist": 20,  # degrees/sec
            "gripper": 5,  # mm/sec
        }

    async def apply_motion(
        self,
        target_state: CraneState,
        max_duration: float = 10.0,
        on_update: Optional[Callable[[CraneState], Awaitable[None]]] = None,
    ):
        """Smoothly transitions to target state over a duration asynchronously."""
        start_time = asyncio.get_event_loop().time()

        while asyncio.get_event_loop().time() - start_time < max_duration:
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

            if on_update:
                await on_update(self.state)
            # Check if we've reached the target state
            if all(
                abs(getattr(self.state, key) - getattr(target_state, key))
                < self.max_speeds[key] * 0.1
                for key in self.max_speeds
            ):
                logger.debug("Reached target state")
                break
            await asyncio.sleep(0.1)  # Non-blocking sleep
