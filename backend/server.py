from fastapi import FastAPI, WebSocket
from crane.crane_service import CraneService, CraneState
from crane.motion_controller import MotionController
from crane.models import CraneOrientation, MessageType, CraneStateMessage, Response, XYZPositionMessage, DEFAULT_CRANE
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
initial_orientation = CraneOrientation(x=0, y=0, z=0, rotationZ=0)
crane = DEFAULT_CRANE
controller = MotionController(initial_state, crane)

async def update_crane_state(websocket: WebSocket, target_state: CraneState, orientation: CraneOrientation) -> None:
    logger.info(f"Moving to target state: {target_state.__dict__}")

    async def send_update(state: CraneState):
        message = Response(
            craneState=state,
            xyzPosition=CraneService.swing_lift_elbow_to_xyz(state, crane, orientation),
            targetState=target_state,
            targetXyzPostion=CraneService.swing_lift_elbow_to_xyz(target_state, crane, orientation),
            success=True
        )
        logger.debug(f"Sending message: {message.model_dump()}")
        await websocket.send_json(message.model_dump())

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
    await update_crane_state(websocket, target_state, message.orientation)


async def handle_xyz_position_message(
    websocket: WebSocket, message: XYZPositionMessage
) -> None:
    # TODO: Implement inverse kinematics to convert xyz to crane state
    # For now, just log the request
    logger.info(f"Received XYZ position request: {message.target}")
    target_state = CraneService.xyz_to_crane_state(message.target, 
                                                  controller.state, 
                                                  message.orientation,
                                                  crane)
    if target_state:
        await update_crane_state(websocket, target_state, message.orientation)
    else:
        logger.error("Failed to convert XYZ position to crane state")
        await websocket.send_json(Response(success=False, errorMessage="No valid way to reach target position").model_dump())

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    logger.info("New WebSocket connection established")
    await websocket.accept()

    try:
        while True:
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
    except RuntimeError as e:
        # TODO: Is this really the best way to catch disconnects?
        if "disconnect" in str(e).lower():
            logger.info("Client disconnected")
        else:
            logger.error(f"RuntimeError in websocket connection: {e}", exc_info=True)
    except KeyboardInterrupt as e:
        logger.info("Keyboard interrupt")
        raise e
    except Exception as e:
        logger.error(f"Error in websocket connection: {e}", exc_info=True)
    finally:
        logger.info("Closing WebSocket connection")
        await websocket.close()
