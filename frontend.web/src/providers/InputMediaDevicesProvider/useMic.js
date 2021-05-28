import { useCallback, useEffect, useMemo, useState } from "react";
// import { EVT_DESTROYED } from "@shared/audio/MediaStreamAudioController";
// import useMediaStreamAudioController from "./useMediaStreamAudioController";

export default function useMic({
  defaultAudioInputDevice,
  defaultAudioNoiseSuppression,
  defaultAudioEchoCancellation,
  defaultAudioAutoGainControl,
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

      // TODO: Reimplement
      // micAudioController.once(EVT_DESTROYED, _handleMicControllerDestroyed);
      /*
      return function unmount() {
        micAudioController.off(EVT_DESTROYED, _handleMicControllerDestroyed);
      };
      */
    }
  }, [micAudioController]);

  // TODO: Reimplement
  // const { captureAudioMedia } = useMediaStreamAudioController();

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
            echoCancellation: defaultAudioEchoCancellation,
            noiseSuppression: defaultAudioNoiseSuppression,
            autoGainControl: defaultAudioAutoGainControl,
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

      // TODO: Reimplement
      // const newMicAudioController = await captureAudioMedia(audioConstraints);
      // setMicAudioController(newMicAudioController);
      // return newMicAudioController;
    },
    [
      // captureAudioMedia,
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
