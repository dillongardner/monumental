import asyncio

class MotionController:
    def __init__(self, state):
        self.state = state
        self.max_speeds = {
            "swing": 10,  # degrees/sec
            "lift": 50,  # mm/sec
            "elbow": 15,  # degrees/sec
            "wrist": 20,  # degrees/sec
            "gripper": 5  # mm/sec
        }

    async def apply_motion(self, target_state, duration=1.0):
        """Smoothly transitions to target state over a duration asynchronously."""
        start_time = asyncio.get_event_loop().time()

        while asyncio.get_event_loop().time() - start_time < duration:
            for key in self.max_speeds:
                step = self.max_speeds[key] * 0.1  # Adjust per tick
                current = getattr(self.state, key)
                target = target_state[key]

                if abs(target - current) > step:
                    setattr(self.state, key, current + step if target > current else current - step)

            await asyncio.sleep(0.1)  # Non-blocking sleep
