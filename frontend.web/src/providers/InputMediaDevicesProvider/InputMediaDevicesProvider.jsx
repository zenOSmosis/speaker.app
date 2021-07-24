import React, { createContext, useCallback } from "react";

import useAudioDeviceDefaults from "./useAudioDeviceDefaults";
import useMic from "./useMic";
import useScreenCapture from "./useScreenCapture";
import { utils } from "media-stream-track-controller";
import { fetchMediaDevices } from "media-stream-track-controller/src/utils";

export const InputMediaDevicesContext = createContext({});

export default function InputMediaDevicesProvider({ children }) {
  const {
    defaultAudioInputDevice,
    setDefaultAudioInputDevice,
    defaultAudioNoiseSuppression,
    setDefaultAudioNoiseSuppression,
    defaultAudioEchoCancellation,
    setDefaultAudioEchoCancellation,
    defaultAudioAutoGainControl,
    setDefaultAudioAutoGainControl,
  } = useAudioDeviceDefaults();

  const {
    startMic,
    stopMic,
    hasUIMicPermission,
    isMicStarted,
    setHasUIMicPermission,
    micAudioController,
    setMicAudioController,
  } = useMic({
    defaultAudioInputDevice,
    defaultAudioNoiseSuppression,
    defaultAudioEchoCancellation,
    defaultAudioAutoGainControl,
  });

  const {
    isScreenSharingSupported,
    startScreenCapture,
    stopScreenCapture,
    toggleScreenCapture,
    screenCaptureMediaStreams,
    isScreenSharing,
  } = useScreenCapture();

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
        defaultAudioInputDevice,
        setDefaultAudioInputDevice,
        defaultAudioNoiseSuppression,
        setDefaultAudioNoiseSuppression,
        defaultAudioEchoCancellation,
        setDefaultAudioEchoCancellation,
        defaultAudioAutoGainControl,
        setDefaultAudioAutoGainControl,
        startMic,
        stopMic,
        hasUIMicPermission,
        isMicStarted,
        setHasUIMicPermission,
        micAudioController,
        setMicAudioController,
        fetchMediaInputDevices: utils.fetchMediaDevices,

        // TODO: Reimplement
        // getAudioControllerWithDeviceId,
        // toggleCaptureAudioMedia,
        // captureAudioMedia,
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
