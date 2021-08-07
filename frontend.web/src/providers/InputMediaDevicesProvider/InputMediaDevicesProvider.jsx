import React, { createContext, useCallback, useEffect, useState } from "react";

import useAudioInputMediaDevicesCache from "./useAudioInputMediaDevicesCache";
// import useMic from "./useMic";
import useScreenCapture from "./useScreenCapture";
import { utils } from "media-stream-track-controller";

export const InputMediaDevicesContext = createContext({});

// TODO: Implement ability to retain previously selected audio input devices

export default function InputMediaDevicesProvider({ children }) {
  const [audioInputMediaDevices, _setAudioInputMediaDevices] = useState([]);

  /**
   * Obtains list of available audio input media devices and sets internal hook
   * state.
   *
   * @param {boolean} isAggressive? [default = true]
   * @return {Promise{MediaDeviceInfo[]}}
   */
  const fetchAudioInputMediaDevices = useCallback(
    async (isAggressive = true) => {
      const audioInputMediaDevices =
        await utils.fetchMediaDevices.fetchAudioInputMediaDevices(isAggressive);

      _setAudioInputMediaDevices(audioInputMediaDevices);

      return audioInputMediaDevices;
    },
    []
  );

  const {
    defaultAudioInputMediaDevice,
    setDefaultAudioInputMediaDevice,

    defaultAudioNoiseSuppression,
    setDefaultAudioNoiseSuppression,

    defaultAudioEchoCancellation,
    setDefaultAudioEchoCancellation,

    defaultAudioAutoGainControl,
    setDefaultAudioAutoGainControl,
  } = useAudioInputMediaDevicesCache({ audioInputMediaDevices });

  // TODO: Change or remove
  /*
  const {
    startMic,
    stopMic,
    hasUIMicPermission,
    setHasUIMicPermission,
    isMicStarted,
    micAudioController,
    setMicAudioController,
  } = useMic({
    defaultAudioInputDevice,
    defaultAudioNoiseSuppression,
    defaultAudioEchoCancellation,
    defaultAudioAutoGainControl,
  });
  */

  const {
    isScreenSharingSupported,
    startScreenCapture,
    stopScreenCapture,
    toggleScreenCapture,
    screenCaptureMediaStreams,
    isScreenSharing,
  } = useScreenCapture();

  // TODO: Move into media-stream-track-controller
  /**
   * Creates a video MediaStreamTrack from the given DOM Canvas element.
   *
   * Note: This is not an async Promise, such as the other capture methods here
   * contain.
   *
   * @param {HTMLCanvasElement} elCanvas
   * @param {number} frameRate? [default = 25]
   * @return {MediaStreamTrack} Video media stream track.
   */
  /*
  captureCanvas(elCanvas, frameRate = 25) {
    const canvasMediaStream = elCanvas.captureStream(frameRate);
    const videoMediaStreamTrack = canvasMediaStream.getVideoTracks()[0];

    return videoMediaStreamTrack;
  }
  */

  return (
    <InputMediaDevicesContext.Provider
      value={{
        // Start audio quality settings
        defaultAudioNoiseSuppression,
        setDefaultAudioNoiseSuppression,

        defaultAudioEchoCancellation,
        setDefaultAudioEchoCancellation,

        defaultAudioAutoGainControl,
        setDefaultAudioAutoGainControl,
        // End audio quality settings

        fetchAudioInputMediaDevices,
        audioInputMediaDevices,

        defaultAudioInputMediaDevice,
        setDefaultAudioInputMediaDevice,

        // startDefaultAudioInputMediaDevice,
        // stopDefaultAudioInputMediaDevice,
        // isDefaultAudioInputMediaDeviceStarted,

        hasAudioInputPermission,
        setHasAudioInputPermission,

        inputAudioDeviceControllers,

        // TODO: Change or remove
        /*
        startMic,
        stopMic,
        isMicStarted,
        hasUIMicPermission,
        setHasUIMicPermission,
        micAudioController,
        setMicAudioController,
        */

        fetchAudioInputMediaDevices:
          utils.fetchMediaDevices.fetchAudioInputMediaDevices,

        /**
         * @param {Object} constraints? [optional; default = {}]
         * @param {Object} factoryOptions? [optional; default = {}]
         * @return {Promise<MediaStreamTrackControllerFactory>}
         */
        captureDeviceMedia: utils.captureDeviceMedia,
        getIsDeviceMediaCaptureSupported:
          utils.getIsDeviceMediaCaptureSupported,

        // TODO: Reimplement
        // getAudioControllerWithDeviceId,
        // getMonitoringMediaStreamAudioTracks,

        isScreenSharingSupported,
        startScreenCapture,
        stopScreenCapture,
        toggleScreenCapture,
        screenCaptureMediaStreams,
        isScreenSharing,
      }}
    >
      {children}
    </InputMediaDevicesContext.Provider>
  );
}
