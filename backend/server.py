from fastapi import FastAPI, WebSocket
from crane.crane_state import CraneState
from crane.motion_controller import MotionController
from crane import compute_ik

app = FastAPI()
state = CraneState(0, 500, 0, 0, 10)
motion = MotionController(state)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        try:
            data = await websocket.receive_json()
            if "target" in data:
                target_pose = compute_ik(**data["target"])
                motion.apply_motion(target_pose)
            await websocket.send_json(state.__dict__)
        except Exception as e:
            print(f"Error: {e}")
            break
