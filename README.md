# Monumental Takehome

A solution to a take-home from Monumental

## How to Run

Both the backend and frontend can be run through docker

* Build docker images `docker compose build`
* Run with `docker compose up`
* The frontend runs on port 3000
* The backend runs on port 8000 

### Running without Docker

#### Backend

The backend system runs on python 3.13. It is an

* Create a virtualenv for python 3.13
  * I personally use `uv`, so achieve this with `uv venv --python 3.13` from within the `backend` directory
* With the virtualenv active, install the backend package (e.g. `uv pip install .`)
* From within the backend directory run `uvicorn server:app --host 0.0.0.0 --port 8000 --reload`


#### Frontend

From within the `frontend` directory

* Install dependencies with `npm install`
* Build with `npm run build`
* Run with `npm start`


### Installation script

For Mac users, can set up dependencies by running the `install.sh` script


## Comments

* Acceleration - to constrain scope a bit, I did not implement acceleration of the motors. Instead motors always move at their maximum speed. To extend the work to include acceperation, the `CraneState` would need to include velocity as well as position and the `Crane` would need to include accelerations as well as max speeds. In each update of state, the velocities would be updated based on the acceleration and the motor positions based on the current velocities.
* Crane Orientation - I figure it makes most sense for frontend to dictate the crane orientation as the frontend represents the user of the crane and the backend represents the controls. The user is then the source of orientation changes and so I don't think it makes sense for the backend to be dictating to the frontend a movement of the orientation over time. This approach fits more naturally with the challenges of a noisy sensor, oscillatory movement, and delays. In all cases, the backend can treat this as an input stream from an orientation sensor. I did not implement movement of the crane orientation beyond a jump to a new position. But the underlying data exchanges would easily handle such movement.
* UI - I made the choice to have the panel to control the motor positions update as the crane moves. The XYZ location, however, only shows the last submited XYZ target location. Eh. There are trade-offs here that seem beyond the scope of the project
* Configuration - I modeled the problem to have the specifics of the Crane configured in the backend. This includes the max speeds and the dimensions. The idea is that the dimensions of the crane are sent to the front end during initialization. I did not, however, implement this and so the dimensions of the crane are specified twice - once in the frontend code and once in the backend. I intentionally modeled the components of the Crane on the backend to mirror how the crane is rendered on the front end to make it easier to extend the approach for multiple dimensions and components
* Limits - The code can be extended to support limits. THis is stubbed out a bit with the `is_valid_position` method and error messaging
* Bonus questions - here are a few ideas that are relevant to how to handle these kinds of problems
  * Kalman filters - if there is a sensor with noise, a standard way of dealing with that is Kalman filter
  * Forecasting - in all of these examples, the problem can be thought of as a forecasting problem. Given a sequence of (delayed) inputs from a sensor, the task is to predict the true value now and/or in the future. There are a wide range of tools to handle these kinds of problems and the right choice will depend on the specifics
  * open/closed loop controller - the design here is an open loop controller. An alternative approach would be to develop closed loop controls in which feedback are used in the control decisions.


