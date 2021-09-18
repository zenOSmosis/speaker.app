import React, { useCallback, useEffect, useState } from "react";

import useSplitAppMessageBus, {
  MAIN_APP_EVT_INIT_TRANSCODER_CONNECTION,
  TRANSCODER_EVT_READY,
  TRANSCODER_EVT_CONNECTED,
  TRANSCODER_EVT_DISCONNECTED,
} from "@hooks/useSplitAppMessageBus";

export const TranscoderSandboxContext = React.createContext({});

export const LAUNCH_TARGET_SELF = "self";
export const LAUNCH_TARGET_IFRAME = "IFrame";
export const LAUNCH_TARGET_NEW_WINDOW = "window";

/**
 * Acts as a gateway controller for the in-browser transcoder host server.
 */
export default function TranscoderSandboxProvider({ children }) {
  const [transcoderIFrame, setTranscoderIFrame] = useState(null);
  const [controlledWindow, setControlledWindow] = useState(null);
  const [isTranscoderConnected, setIsTranscoderConnected] = useState(false);

  const destroyTranscoder = useCallback(() => {
    // Unmount, if mounted
    setTranscoderIFrame(null);

    try {
      if (controlledWindow) {
        controlledWindow.close();
      }
    } catch (err) {
      console.warn("Caught", err);
    } finally {
      setControlledWindow(null);
    }
  }, [controlledWindow]);

  const transcoderMessageBus = useSplitAppMessageBus();

  // Handle received events from transcoder
  useEffect(() => {
    if (transcoderMessageBus) {
      const handleTranscoderConnected = () => {
        setIsTranscoderConnected(true);
      };

      const handleTranscoderDisconnected = () => {
        setIsTranscoderConnected(false);
      };

      transcoderMessageBus.on(
        TRANSCODER_EVT_CONNECTED,
        handleTranscoderConnected
      );
      transcoderMessageBus.on(
        TRANSCODER_EVT_DISCONNECTED,
        handleTranscoderDisconnected
      );

      return function unmount() {
        transcoderMessageBus.off(
          TRANSCODER_EVT_CONNECTED,
          handleTranscoderConnected
        );
        transcoderMessageBus.off(
          TRANSCODER_EVT_DISCONNECTED,
          handleTranscoderDisconnected
        );
      };
    }
  }, [transcoderMessageBus]);

  // Set disconnected state if no iframe or controlled window
  useEffect(() => {
    if (!transcoderIFrame && !controlledWindow) {
      setIsTranscoderConnected(false);
    }
  }, [transcoderIFrame, controlledWindow]);

  const initTranscoder = useCallback(
    async (params) => {
      // Destroy existing transcoder, if present
      destroyTranscoder();

      const { launchTarget, ...transcoderConnectionParams } = params;

      // TODO: Replace this w/ message bus passing
      // TODO: Obtain from imported constant
      const transcoderURI = "/server"; // createTranscoderURI(rest);

      switch (launchTarget) {
        // Replace the current app w/ the transcoder app
        // (Most memory efficient)
        case LAUNCH_TARGET_SELF:
          window.location.href = transcoderURI;
          break;

        // Launch transcoder app within an iframe (embedded)
        // (Most efficient if wanting to join the call from the same browser)
        case LAUNCH_TARGET_IFRAME:
          setTranscoderIFrame(
            <iframe
              // TODO: Handle proper sandbox permissions (anything in regards to performance??)
              src={transcoderURI}
              title="Server"
              style={{ display: "none" }}
            />
          );

          break;

        // Launch transcoder app in a new window
        // (Least efficient, but allows greater flexibility for debugging and experimentation)
        case LAUNCH_TARGET_NEW_WINDOW:
          const controlledWindow = window.open(transcoderURI, "_blank");

          setControlledWindow(controlledWindow);
          break;

        default:
          throw new Error(`Invalid launch target "${launchTarget}"`);
      }

      transcoderMessageBus.once(TRANSCODER_EVT_READY, () => {
        transcoderMessageBus.sendEvent(
          MAIN_APP_EVT_INIT_TRANSCODER_CONNECTION,
          transcoderConnectionParams
        );
      });
    },
    [destroyTranscoder, transcoderMessageBus]
  );

  return (
    <TranscoderSandboxContext.Provider
      value={{ initTranscoder, destroyTranscoder, isTranscoderConnected }}
    >
      <React.Fragment>
        {children}

        {transcoderIFrame}
      </React.Fragment>
    </TranscoderSandboxContext.Provider>
  );
}
