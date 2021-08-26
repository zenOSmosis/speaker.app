import React from "react";
import useScreenCapture from "./useScreenCapture";

const ScreenCaptureContext = React.createContext({});

// TODO: Document
export default function ScreenCaptureProvider({ children }) {
  const {
    isScreenSharingSupported,
    startScreenCapture,
    stopScreenCapture,
    toggleScreenCapture,
    screenCaptureMediaStreams,
    screenCaptureControllerFactories,
    isScreenSharing,
  } = useScreenCapture();

  return (
    <ScreenCaptureContext.Provider
      value={{
        isScreenSharingSupported,
        startScreenCapture,
        stopScreenCapture,
        toggleScreenCapture,
        screenCaptureMediaStreams,
        screenCaptureControllerFactories,
        isScreenSharing,
      }}
    >
      {children}
    </ScreenCaptureContext.Provider>
  );
}

export { ScreenCaptureContext };
