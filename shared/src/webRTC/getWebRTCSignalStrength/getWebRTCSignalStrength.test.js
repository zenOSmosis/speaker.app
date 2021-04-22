import getWebRTCSignalStrength from "./getWebRTCSignalStrength";

describe("getWebRTCSignalStrength", () => {
  it("Detects 100% signal strength", () => {
    expect(getWebRTCSignalStrength(98)).toEqual(1);
  });

  it("Detects 75% signal strength", () => {
    expect(getWebRTCSignalStrength(400)).toEqual(0.25);
  });

  it("Detects 50% signal strength", () => {
    expect(getWebRTCSignalStrength(300)).toEqual(0.5);
  });

  it("Detects 25% signal strength", () => {
    expect(getWebRTCSignalStrength(200)).toEqual(0.75);
  });

  it("Detects minimal signal strength", () => {
    expect(getWebRTCSignalStrength(500)).toEqual(0.01);

    expect(getWebRTCSignalStrength(505)).toEqual(0.01);

    expect(getWebRTCSignalStrength(1505)).toEqual(0.01);
  });
});
