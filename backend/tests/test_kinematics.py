import pytest
from crane.crane import SwingLiftElbow, XYZPosition, DEFAULT_CRANE


def test_simple_cases():
    crane = DEFAULT_CRANE
    xyz_for_zeros = XYZPosition(
        x=DEFAULT_CRANE.upper_arm.width + DEFAULT_CRANE.lower_arm.width,
        y=-DEFAULT_CRANE.upper_spacer.height - DEFAULT_CRANE.lower_spacer.height,
        z=0,
    )
    swing_lift_elbow = crane.xyz_to_swing_lift_elbow(xyz_for_zeros)
    assert swing_lift_elbow is not None
    assert swing_lift_elbow.swing == 0
    assert swing_lift_elbow.lift == 0
    assert swing_lift_elbow.elbow == 0
    out_of_bounds = XYZPosition(
        x=DEFAULT_CRANE.upper_arm.width + DEFAULT_CRANE.lower_arm.width + 1, y=0, z=0
    )
    swing_lift_elbow = crane.xyz_to_swing_lift_elbow(out_of_bounds)
    assert swing_lift_elbow is None


@pytest.mark.parametrize(
    "swe_there",
    [
        SwingLiftElbow(swing=30, lift=2, elbow=70),
        SwingLiftElbow(swing=0, lift=0, elbow=0),
        SwingLiftElbow(swing=45, lift=1, elbow=90),
        SwingLiftElbow(swing=-30, lift=2.5, elbow=45),
        SwingLiftElbow(swing=60, lift=1.5, elbow=120),
    ],
)
def test_swe_there_and_back_again(swe_there):
    crane = DEFAULT_CRANE
    xyz = crane.swing_lift_elbow_to_xyz(swe_there)
    assert xyz is not None
    swe_back = crane.xyz_to_swing_lift_elbow(xyz)
    assert swe_back is not None
    assert swe_back.swing == pytest.approx(swe_there.swing)
    assert swe_back.lift == pytest.approx(swe_there.lift)
    assert swe_back.elbow == pytest.approx(swe_there.elbow)


@pytest.mark.parametrize(
    "xyz_there",
    [
        XYZPosition(x=1, y=2, z=1),
        XYZPosition(x=0.5, y=1, z=0.5),
        XYZPosition(x=1.5, y=0, z=0),
        XYZPosition(x=1, y=-0.5, z=0.8),
        XYZPosition(x=0.8, y=1.2, z=-0.3),
    ],
)
def test_xyz_there_and_back_again(xyz_there):
    crane = DEFAULT_CRANE
    swe = crane.xyz_to_swing_lift_elbow(xyz_there)
    assert swe is not None
    xyz_back = crane.swing_lift_elbow_to_xyz(swe)
    assert xyz_back is not None
    assert xyz_back.x == pytest.approx(xyz_there.x)
    assert xyz_back.y == pytest.approx(xyz_there.y)
    assert xyz_back.z == pytest.approx(xyz_there.z)
