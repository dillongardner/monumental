from fastapi import FastAPI, WebSocket
from crane.crane import CraneState, Crane
from crane.motion_controller import MotionController
import logging
import sys
# from crane import compute_ik

# Set up logging configuration
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)
# Ensure our logger's level is set to DEBUG
logger.setLevel(logging.DEBUG)

app = FastAPI()
initial_state = CraneState(0, 1, 0, 0, 0)
crane = Crane()
controller = MotionController(initial_state, crane)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    logger.info("New WebSocket connection established")
    await websocket.accept()
    while True:
        await websocket.send_json(controller.state.__dict__)
        try:
            data = await websocket.receive_json()
            logger.debug(f"Received data: {data}")

            if "target" in data:
                target_state = CraneState(
                    swing=data["target"].get("swing", controller.state.swing),
                    lift=data["target"].get("lift", controller.state.lift),
                    elbow=data["target"].get("elbow", controller.state.elbow),
                    wrist=data["target"].get("wrist", controller.state.wrist),
                    gripper=data["target"].get("gripper", controller.state.gripper),
                )
                logger.info(f"Moving to target state: {target_state.__dict__}")

                async def send_update(state):
                    logger.debug(f"State update: {state.__dict__}")
                    logger.debug(f"Target state: {target_state.__dict__}")
                    await websocket.send_json(state.__dict__)

                await controller.apply_motion(target_state, on_update=send_update)
            await websocket.send_json(controller.state.__dict__)
        except Exception as e:
            logger.error(f"WebSocket error: {e}", exc_info=True)
            raise e
