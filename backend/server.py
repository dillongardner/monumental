from fastapi import FastAPI, WebSocket
from crane.crane_service import CraneService, CraneState
from crane.motion_controller import MotionController
from crane.models import CraneOrientation, MessageType, CraneStateMessage, Response, XYZPositionMessage, DEFAULT_CRANE, Status
import logging
import sys
import asyncio

# Set up logging configuration
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)
# Ensure our logger's level is set to DEBUG
logger.setLevel(logging.DEBUG)

# Configuration
POLLING_INTERVAL_SECONDS = 0.1  

app = FastAPI()
initial_state = CraneState(swing=0, lift=2, elbow=0, wrist=0, gripper=0)
initial_orientation = CraneOrientation(x=0, y=0, z=0, rotationZ=0)
crane = DEFAULT_CRANE
controller = MotionController(initial_state, crane)

class StateManager:
    def __init__(self):
        self.error_state = None
        self.error_message = None
        self.previous_state = None

state_manager = StateManager()

async def stream_state(websocket: WebSocket, orientation: CraneOrientation):
    """Stream the current crane state at fixed intervals."""
    state_manager.previous_state = controller.state.model_copy()
    while True:
        try:
            new_state = controller.state
            message = Response(
                craneState=controller.state,
                xyzPosition=CraneService.swing_lift_elbow_to_xyz(
                    controller.state, 
                    crane, 
                    orientation
                ),
                success=state_manager.error_state is None,
                status=state_manager.error_state if state_manager.error_state else (Status.MOVING if new_state != state_manager.previous_state else Status.STOPPED),
                errorMessage=state_manager.error_message
            )
            await websocket.send_json(message.model_dump())
            state_manager.previous_state = new_state.model_copy()
            await asyncio.sleep(POLLING_INTERVAL_SECONDS)
        except Exception as e:
            logger.error(f"Error in state stream: {e}", exc_info=True)
            break

async def update_crane_state(target_state: CraneState) -> None:
    """Update the crane state without sending updates."""
    logger.info(f"Moving to target state: {target_state.__dict__}")
    await controller.apply_motion(target_state)

async def handle_crane_state_message(message: CraneStateMessage) -> None:
    target_state = CraneState(
        swing=message.target.swing,
        lift=message.target.lift,
        elbow=message.target.elbow,
        wrist=message.target.wrist,
        gripper=message.target.gripper,
    )
    state_manager.error_state = None
    state_manager.error_message = None
    await update_crane_state(target_state)

async def handle_xyz_position_message(message: XYZPositionMessage) -> None:
    logger.info(f"Received XYZ position request: {message.target}")
    target_state = CraneService.xyz_to_crane_state(
        message.target, 
        controller.state, 
        message.orientation,
        crane
    )
    if target_state:
        state_manager.error_state = None
        state_manager.error_message = None
        await update_crane_state(target_state)
    else:
        logger.error("Failed to convert XYZ position to crane state")
        state_manager.error_state = Status.ERROR
        state_manager.error_message = "Failed to convert XYZ position to crane state"
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    logger.info("New WebSocket connection established")
    await websocket.accept()
    
    # Start the state streaming task
    stream_task = None
    current_orientation = initial_orientation

    try:
        # Start the state stream
        stream_task = asyncio.create_task(stream_state(websocket, current_orientation))
        
        # Handle incoming messages
        while True:
            data = await websocket.receive_json()
            logger.debug(f"Received data: {data}")

            match data.get("type"):
                case MessageType.CRANE_STATE:
                    message = CraneStateMessage(**data)
                    current_orientation = message.orientation
                    await handle_crane_state_message(message)
                case MessageType.XYZ_POSITION:
                    message = XYZPositionMessage(**data)
                    current_orientation = message.orientation
                    await handle_xyz_position_message(message)
                case _:
                    logger.error(f"Unknown message type: {data.get('type')}")
                    continue
    except RuntimeError as e:
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
        # Cancel the streaming task
        if stream_task:
            stream_task.cancel()
            try:
                await stream_task
            except asyncio.CancelledError:
                pass
        logger.info("Closing WebSocket connection")
        await websocket.close()
