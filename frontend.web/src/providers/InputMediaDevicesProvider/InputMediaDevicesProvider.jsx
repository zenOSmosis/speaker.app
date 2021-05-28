import React, { createContext, useCallback } from "react";

import useAudioDeviceDefaults from "./useAudioDeviceDefaults";
import useAudioMediaStreamTrackController from "./useAudioMediaStreamTrackController";
import useMic from "./useMic";
import useScreenCapture from "./useScreenCapture";

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

  /**
   * List cameras, microphones, etc.
   *
   * @return {Promise<MediaDeviceInfo[]>}
   */
  const fetchMediaInputDevices = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.warn("enumerateDevices() not supported.");
      return [];
    }

    const fetchDevices = () => navigator.mediaDevices.enumerateDevices();

    let devices = await fetchDevices();

    // If not able to fetch label for all devices...
    if (devices.some(({ label }) => !label.length)) {
      // ... temporarily turn on microphone...
      const tempMediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      //  ... and fetch again
      devices = await fetchDevices();

      // ... then turn off the mic
      tempMediaStream.getTracks().forEach(track => track.stop());
    }

    return devices;
  }, []);

  const { captureAudioMedia } = useAudioMediaStreamTrackController();

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
        fetchMediaInputDevices,
        // getAudioControllerWithDeviceId,
        // toggleCaptureAudioMedia,
        captureAudioMedia,
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
