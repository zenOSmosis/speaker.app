import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MediaStreamTrackControllerEvents,
  utils,
} from "media-stream-track-controller";
import { logger } from "phantom-core";

const { EVT_DESTROYED } = MediaStreamTrackControllerEvents;
const { captureDeviceMedia } = utils;

export default function useMic({
  defaultAudioInputDevice,
  defaultAudioNoiseSuppression,
  defaultAudioEchoCancellation,
  defaultAudioAutoGainControl,
}) {
  const [micAudioController, setMicAudioController] = useState(null);

  // FIXME: Should this really default to true?
  const [hasUIMicPermission, setHasUIMicPermission] = useState(true);

  // Destruct mic controller if no UI mic permissions are available
  useEffect(() => {
    if (!hasUIMicPermission && micAudioController) {
      micAudioController.destroy();
    }
  }, [hasUIMicPermission, micAudioController]);

  // Update hook state when mic controller is destructed
  useEffect(() => {
    if (micAudioController) {
      const _handleMicControllerDestroyed = () => {
        setMicAudioController(null);
      };

      micAudioController.once(EVT_DESTROYED, _handleMicControllerDestroyed);

      return function unmount() {
        micAudioController.off(EVT_DESTROYED, _handleMicControllerDestroyed);
      };
    }
  }, [micAudioController]);

  const refIsMicStarting = useRef(false);

  /**
   * @param {Object} audioConstraints? [optional; default = {}] These get
   * merged into the audio constraints set in useMediaStreamAudioController.
   * @return {Promise<MediaStreamAudioController | void>}
   */
  const startMic = useCallback(
    async (audioConstraints = {}) => {
      if (micAudioController || refIsMicStarting.current) {
        console.warn("Microphone is already starting or has started");
        return;
      }

      refIsMicStarting.current = true;

      if (defaultAudioInputDevice) {
        audioConstraints = {
          ...audioConstraints,
          ...{
            echoCancellation: defaultAudioEchoCancellation,
            noiseSuppression: defaultAudioNoiseSuppression,
            autoGainControl: defaultAudioAutoGainControl,
            deviceId: {
              exact: defaultAudioInputDevice.deviceId,
            },
          },
        };
      }

      try {
        const newMicAudioController = await captureDeviceMedia(
          audioConstraints
        );

        refIsMicStarting.current = false;

        setMicAudioController(newMicAudioController);
        return newMicAudioController;
      } catch (err) {
        logger.error(err);

        refIsMicStarting.current = false;
      }
    },
    [
      micAudioController,
      defaultAudioInputDevice,
      defaultAudioEchoCancellation,
      defaultAudioNoiseSuppression,
      defaultAudioAutoGainControl,
    ]
  );

  /**
   * @return {Promise<void>}
   */
  const stopMic = useCallback(async () => {
    if (micAudioController) {
      await micAudioController.destroy();
    }
  }, [micAudioController]);

  /**
   * @type {boolean}
   */
  const isMicStarted = useMemo(
    () => Boolean(micAudioController),
    [micAudioController]
  );

  return {
    startMic,
    stopMic,
    hasUIMicPermission,
    isMicStarted,
    setHasUIMicPermission,
    micAudioController,
    setMicAudioController,
  };
}
