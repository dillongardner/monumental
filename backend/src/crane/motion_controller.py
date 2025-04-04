import asyncio
from crane.crane_service import CraneService
from crane.models import CraneState, Crane
from typing import Optional

import logging

logger = logging.getLogger(__name__)


class MotionController:
    def __init__(self, state: CraneState, crane: Crane):
        self.state = state
        self.crane = crane
        self.time_step = 0.1
        self._current_task: Optional[asyncio.Task] = None
        self._motion_lock = asyncio.Lock()

    async def _execute_motion(
        self,
        target_state: CraneState,
        max_duration: float = 30.0,
    ):
        """Internal method to execute the motion asynchronously."""
        if not CraneService.is_valid_state(target_state, self.crane):
            logger.error("Invalid target state")
            return
        start_time = asyncio.get_event_loop().time()
        last_time = start_time

        while asyncio.get_event_loop().time() - start_time < max_duration:
            current_time = asyncio.get_event_loop().time()
            time_diff = current_time - last_time
            last_time = current_time

            async with self._motion_lock:
                for field in self.crane.max_speeds.model_fields.keys():
                    step = getattr(self.crane.max_speeds, field) * time_diff  
                    current = getattr(self.state, field)
                    target = getattr(target_state, field)

                    if abs(target - current) > step:
                        logger.debug(
                            f"Moving {field} from {current} to {current + step if target > current else current - step}"
                        )
                        setattr(
                            self.state,
                            field,
                            current + step if target > current else current - step,
                        )
                    else:
                        setattr(self.state, field, target)

                # Check if we've reached the target state
                if all(
                    getattr(self.state, field) == getattr(target_state, field)
                    for field in self.state.model_fields.keys()
                ):
                    logger.info("Reached target state")
                    break
            await asyncio.sleep(self.time_step)

    async def apply_motion(
        self,
        target_state: CraneState,
        max_duration: float = 30.0,
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
            self._execute_motion(target_state, max_duration)
        )
        return self._current_task

