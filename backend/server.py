from fastapi import FastAPI, WebSocket
from crane.crane import CraneState, Crane
from crane.motion_controller import MotionController
from crane.messages import MessageType, CraneStateMessage, XYZPositionMessage
import logging
import sys
from typing import Dict, Any, Union
from enum import Enum
from pydantic import BaseModel
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

async def handle_crane_state_message(websocket: WebSocket, message: CraneStateMessage) -> None:
    target_state = CraneState(
        swing=message.target.swing,
        lift=message.target.lift,
        elbow=message.target.elbow,
        wrist=message.target.wrist,
        gripper=message.target.gripper,
    )
    logger.info(f"Moving to target state: {target_state.__dict__}")

    async def send_update(state):
        logger.debug(f"State update: {state.__dict__}")
        await websocket.send_json(state.__dict__)

    await controller.apply_motion(target_state, on_update=send_update)

async def handle_xyz_position_message(websocket: WebSocket, message: XYZPositionMessage) -> None:
    # TODO: Implement inverse kinematics to convert xyz to crane state
    # For now, just log the request
    logger.info(f"Received XYZ position request: {message.target}")
    # Here you would implement the inverse kinematics calculation
    # and then call controller.apply_motion with the resulting crane state

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    logger.info("New WebSocket connection established")
    await websocket.accept()
    
    while True:
        await websocket.send_json(controller.state.__dict__)
        try:
            data = await websocket.receive_json()
            logger.debug(f"Received data: {data}")

            message_type = data.get("type")
            if message_type == MessageType.CRANE_STATE:
                await handle_crane_state_message(websocket, CraneStateMessage(**data))
            elif message_type == MessageType.XYZ_POSITION:
                await handle_xyz_position_message(websocket, XYZPositionMessage(**data))
            else:
                logger.error(f"Unknown message type: {message_type}")
                continue

            await websocket.send_json(controller.state.__dict__)
        except Exception as e:
            logger.error(f"WebSocket error: {e}", exc_info=True)
            raise e
