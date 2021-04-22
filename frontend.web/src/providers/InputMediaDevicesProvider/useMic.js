import { useCallback, useEffect, useMemo, useState } from "react";
import { EVT_DESTROYED } from "@shared/audio/MediaStreamAudioController";
import useMediaStreamAudioController from "./useMediaStreamAudioController";

export default function useMic({
  defaultAudioInputDevice,
  defaultIsAudioNoiseSuppression,
  defaultIsAudioEchoCancellation,
  defaultIsAudioAutoGainControl,
}) {
  const [micAudioController, setMicAudioController] = useState(null);
  const [hasUIMicPermission, setHasUIMicPermission] = useState(true);

  useEffect(() => {
    if (!hasUIMicPermission && micAudioController) {
      micAudioController.destroy();
    }
  }, [hasUIMicPermission, micAudioController]);

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

  const { captureAudioMedia } = useMediaStreamAudioController();

  /**
   * @param {Object} audioConstraints? [optional; default = {}] These get
   * merged into the audio constraints set in useMediaStreamAudioController.
   * @return {Promise<MediaStreamAudioController>}
   */
  const startMic = useCallback(
    async (audioConstraints = {}) => {
      if (defaultAudioInputDevice) {
        audioConstraints = {
          ...audioConstraints,
          ...{
            echoCancellation: defaultIsAudioEchoCancellation,
            noiseSuppression: defaultIsAudioNoiseSuppression,
            autoGainControl: defaultIsAudioAutoGainControl,
            deviceId: {
              exact: defaultAudioInputDevice.deviceId,
            },
          },
        };
      }

      if (micAudioController) {
        console.warn("Microphone is already started");
        return;
      }

      const newMicAudioController = await captureAudioMedia(audioConstraints);

      setMicAudioController(newMicAudioController);

      return newMicAudioController;
    },
    [
      captureAudioMedia,
      micAudioController,
      defaultAudioInputDevice,
      defaultIsAudioEchoCancellation,
      defaultIsAudioNoiseSuppression,
      defaultIsAudioAutoGainControl,
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

  const isMicStarted = useMemo(() => Boolean(micAudioController), [
    micAudioController,
  ]);

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
