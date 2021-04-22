import { useCallback } from "react";
import MediaStreamAudioController, {
  EVT_UPDATED,
} from "@shared/audio/MediaStreamAudioController";

import useForceUpdate from "@hooks/useForceUpdate";

const DEFAULT_AUDIO_CONSTRAINTS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  sampleRate: 48000,
  sampleSize: 16,
};

export default function useMediaStreamAudioController() {
  /**
   * @param {string} deviceId
   * @return {MediaStreamAudioController | void}
   */
  const getAudioControllerWithDeviceId = useCallback((deviceId) => {
    const audioController = MediaStreamAudioController.getControllerWithDeviceId(
      deviceId
    );

    return audioController;
  }, []);

  /**
   * @return {MediaStreamAudioController[]}
   */
  const getAudioControllers = useCallback(
    () => MediaStreamAudioController.getAudioControllerInstances(),
    []
  );

  const forceUpdate = useForceUpdate();

  /**
   * @param {Object} audioConstraints? [optional; default = {}]
   * @return {Promise<MediaStreamAudioController>}
   */
  const captureAudioMedia = useCallback(
    async (audioConstraints) => {
      const mergedAudioConstraints = {
        ...DEFAULT_AUDIO_CONSTRAINTS,
        ...audioConstraints,
      };

      const inputMediaStream = await navigator.mediaDevices.getUserMedia({
        audio: mergedAudioConstraints,
      });

      const audioController = new MediaStreamAudioController(inputMediaStream);

      // Enable things such as toggleMute to update the UI
      audioController.on(EVT_UPDATED, forceUpdate);

      await audioController.onceReady();

      return audioController;
    },
    [forceUpdate]
  );

  return {
    getAudioControllers,
    getAudioControllerWithDeviceId,
    captureAudioMedia,
  };
}
