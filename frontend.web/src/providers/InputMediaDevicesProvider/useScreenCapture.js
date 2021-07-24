import { useCallback, useMemo, useState } from "react";
// TODO: Use screen capture from media-stream-controller

/**
 * Supports concurrent screen capturing of multiple streams.
 */
export default function useScreenCapture() {
  /** @type {MediaStream[]} */
  const [screenCaptureMediaStreams, setScreenCaptureMediaStreams] = useState(
    []
  );

  const [isScreenSharingSupported, setIsScreenSharingSupported] = useState(
    navigator.mediaDevices &&
      typeof navigator.mediaDevices.getDisplayMedia === "function"
  );

  /**
   * @return {Promise<MediaStream}
   */
  const startScreenCapture = useCallback(async () => {
    let mediaStream;

    try {
      mediaStream = await navigator.mediaDevices.getDisplayMedia({
        // TODO: Make these constraints configurable
        video: {
          cursor: "always",
        },
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 48000,
          sampleSize: 16,
          // Stereo
          // channelCount: 2,
        },
      });
    } catch (err) {
      console.warn("Caught", err);

      // FIXME: Safari 14 (desktop / BrowserStack) throws "Unhandled Rejection
      // (InvalidAccessError): getDisplayMedia must be called from a user
      // gesture handler."
      //
      // This is likely caused by the multiple redirections from calling this
      // directly in a hook.
      if (
        err.message ===
        "getDisplayMedia must be called from a user gesture handler."
      ) {
        alert(
          "There is currently an issue with trying to do screen sharing with Safari.  Please try from a different browser."
        );
      }

      return setIsScreenSharingSupported(false);
    }

    /**
     * Handle auto-cleanup once tracks have ended.
     *
     * This also directly takes into consideration if the screenshare was
     * stopped directly by the native UI.
     */
    (() => {
      const capturedTracks = mediaStream.getTracks();
      let remainingTracks = capturedTracks.length;

      capturedTracks.forEach(track => {
        console.debug("starting track", track.id);

        // FIXME: Firefox 86 doesn't listen to "ended" event, and the
        // functionality has to be monkeypatched into the onended
        // handler.  Note that this still works in conjunction with
        // track.dispatchEvent(new Event("ended")).
        const oEnded = track.onended;
        track.onended = (...args) => {
          if (typeof oEnded === "function") {
            oEnded(...args);
          }

          --remainingTracks;

          if (!remainingTracks) {
            // Unregister screen capture w/ list of streams
            setScreenCaptureMediaStreams(prev =>
              prev.filter(({ id }) => id !== mediaStream.id)
            );
          }
        };
      });
    })();

    // Register screen capture w/ list of streams
    setScreenCaptureMediaStreams(prev => [...prev, mediaStream]);

    return mediaStream;
  }, []);

  /**
   * @param {MediaStream} mediaStream? [optional] If no MediaStream is passed,
   * it will stop all existing screen captures.
   * @return {void}
   */
  const stopScreenCapture = useCallback(
    (mediaStream = null) => {
      if (!mediaStream) {
        // Iterate through all screen captures, and stop those streams
        return screenCaptureMediaStreams.forEach(stream =>
          stopScreenCapture(stream)
        );
      }

      mediaStream.getTracks().forEach(track => {
        track.stop();

        // Dispatch "ended" event so that our auto-cleanup handler runs
        track.dispatchEvent(new Event("ended"));
      });
    },
    [screenCaptureMediaStreams]
  );

  const isScreenSharing = useMemo(
    () => screenCaptureMediaStreams.length > 0,
    [screenCaptureMediaStreams]
  );

  /**
   * @return {Promise<void>}
   */
  const toggleScreenCapture = useCallback(async () => {
    if (isScreenSharing) {
      stopScreenCapture();
    } else {
      await startScreenCapture();
    }
  }, [isScreenSharing, startScreenCapture, stopScreenCapture]);

  return {
    isScreenSharingSupported,
    startScreenCapture,
    stopScreenCapture,
    toggleScreenCapture,
    screenCaptureMediaStreams,
    isScreenSharing,
  };
}
