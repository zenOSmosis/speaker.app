import React, { useCallback } from "react";
import Center from "../../Center";

export default function ScreenCapture({
  // isSocketIoConnected,
  isZenRTCConnected,
  zenRTCPeer,
}) {
  // TODO: Include options for switching
  const handleInitScreenCapture = useCallback(async () => {
    const mediaStream = await zenRTCPeer.captureScreen();

    zenRTCPeer.publishMediaStream(mediaStream);
  }, [zenRTCPeer]);

  return (
    <Center>
      {!isZenRTCConnected ? (
        <span>Connect to start screen sharing.</span>
      ) : (
        <button onClick={handleInitScreenCapture}>Screenshare</button>
      )}
    </Center>
  );
}
