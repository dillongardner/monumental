import math
import pytest
from crane.models import SwingLiftElbow, XYZPosition, DEFAULT_CRANE, CraneOrientation
from crane.crane_service import CraneService


def test_simple_cases():
    xyz_for_zeros = XYZPosition(
        x=DEFAULT_CRANE.upper_arm.width + DEFAULT_CRANE.lower_arm.width,
        y=-DEFAULT_CRANE.upper_spacer.height - DEFAULT_CRANE.lower_spacer.height,
        z=0,
    )
    swing_lift_elbow = CraneService.xyz_to_swing_lift_elbow(xyz_for_zeros, DEFAULT_CRANE)
    assert swing_lift_elbow is not None
    assert swing_lift_elbow.swing == pytest.approx(0, abs=1e-5)
    assert swing_lift_elbow.lift == pytest.approx(0, abs=1e-5)
    assert swing_lift_elbow.elbow == pytest.approx(0, abs=1e-5)


def test_orientation_change():
    xyz = XYZPosition(x=100, y=2, z=1)
    orientation = CraneOrientation(x=100, y=0, z=0, rotationZ=0)
    swe_no_orientation = CraneService.xyz_to_swing_lift_elbow(xyz=xyz, crane=DEFAULT_CRANE)
    assert swe_no_orientation is None
    swe_orientation = CraneService.xyz_to_swing_lift_elbow(xyz=xyz, crane=DEFAULT_CRANE, orientation=orientation)
    assert swe_orientation is not None




@pytest.mark.parametrize(
    "swe_there, orientation",
    [
        (SwingLiftElbow(swing=30, lift=2, elbow=70), None),
        (SwingLiftElbow(swing=30, lift=2, elbow=70), CraneOrientation(x=0, y=0, z=0, rotationZ=0)),
        (SwingLiftElbow(swing=0, lift=0, elbow=0), CraneOrientation(x=0, y=0, z=0, rotationZ=90)),
        (SwingLiftElbow(swing=45, lift=1, elbow=90), CraneOrientation(x=0, y=0, z=0, rotationZ=180)),
        (SwingLiftElbow(swing=-30, lift=2.5, elbow=45), CraneOrientation(x=0.4, y=0.3, z=0.7, rotationZ=-90)),
        (SwingLiftElbow(swing=60, lift=1.5, elbow=120), CraneOrientation(x=0, y=0, z=0, rotationZ=0)),
    ],
)
def test_swe_there_and_back_again(swe_there, orientation):
    xyz = CraneService.swing_lift_elbow_to_xyz(swe_there, DEFAULT_CRANE, orientation)
    assert xyz is not None
    print(f"orientation: {orientation}")
    swe_back = CraneService.xyz_to_swing_lift_elbow(xyz, DEFAULT_CRANE, orientation)
    assert swe_back is not None
    assert swe_back.swing == pytest.approx(swe_there.swing, abs=1e-5)
    assert swe_back.lift == pytest.approx(swe_there.lift, abs=1e-5)
    assert swe_back.elbow == pytest.approx(swe_there.elbow, abs=1e-5)


@pytest.mark.parametrize(
    "xyz_there, orientation",
    [
        (XYZPosition(x=1, y=2, z=1), None),
        (XYZPosition(x=0.5, y=1, z=0.5), None),
        (XYZPosition(x=1.5, y=0, z=0), None),
        (XYZPosition(x=1, y=-0.5, z=0.8), None),
        (XYZPosition(x=0.8, y=1.2, z=-0.3), None),
        (XYZPosition(x=-0.5, y=-1, z=0.5), CraneOrientation(x=0, y=0, z=0, rotationZ=180)),
        (XYZPosition(x=-0.5, y=-1, z=0.5), CraneOrientation(x=0.3, y=0.5, z=1, rotationZ=10)),
        (XYZPosition(x=101, y=0, z=0), CraneOrientation(x=100, y=0, z=0, rotationZ=0)),
    ],
)
def test_xyz_there_and_back_again(xyz_there, orientation):
    swe = CraneService.xyz_to_swing_lift_elbow(xyz_there, DEFAULT_CRANE, orientation)
    assert swe is not None
    xyz_back = CraneService.swing_lift_elbow_to_xyz(swe, DEFAULT_CRANE, orientation)
    assert xyz_back is not None
    assert xyz_back.x == pytest.approx(xyz_there.x)
    assert xyz_back.y == pytest.approx(xyz_there.y)
    assert xyz_back.z == pytest.approx(xyz_there.z)

