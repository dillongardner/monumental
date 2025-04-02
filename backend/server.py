from fastapi import FastAPI, WebSocket
from crane.crane import CraneState, DEFAULT_CRANE
from crane.motion_controller import MotionController
from crane.models import MessageType, CraneStateMessage, XYZPositionMessage
import logging
import sys

# Set up logging configuration
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)
# Ensure our logger's level is set to DEBUG
logger.setLevel(logging.DEBUG)


app = FastAPI()
initial_state = CraneState(swing=0, lift=2, elbow=0, wrist=0, gripper=0)
crane = DEFAULT_CRANE
controller = MotionController(initial_state, crane)


async def update_crane_state(websocket: WebSocket, target_state: CraneState) -> None:
    logger.info(f"Moving to target state: {target_state.__dict__}")

    async def send_update(state):
        logger.debug(f"State update: {state.__dict__}")
        await websocket.send_json(state.__dict__)

    await controller.apply_motion(target_state, on_update=send_update)

async def handle_crane_state_message(
    websocket: WebSocket, message: CraneStateMessage
) -> None:
    target_state = CraneState(
        swing=message.target.swing,
        lift=message.target.lift,
        elbow=message.target.elbow,
        wrist=message.target.wrist,
        gripper=message.target.gripper,
    )
    await update_crane_state(websocket, target_state)


async def handle_xyz_position_message(
    websocket: WebSocket, message: XYZPositionMessage
) -> None:
    # TODO: Implement inverse kinematics to convert xyz to crane state
    # For now, just log the request
    logger.info(f"Received XYZ position request: {message.target}")
    target_state = controller.crane.xyz_to_crane_state(message.target, 
                                                       controller.state, 
                                                       message.orientation)
    if target_state:
        await update_crane_state(websocket, target_state)
    else:
        logger.error("Failed to convert XYZ position to crane state")


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
        except KeyboardInterrupt as e:
            logger.info("Keyboard interrupt")
            raise e
        except Exception as e:
            logger.error(f"Unknown error: {e}", exc_info=True)
