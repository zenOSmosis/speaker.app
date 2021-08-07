import React, { createContext, useCallback, useState } from "react";

import useAudioInputDevicesCache from "./useAudioInputDevicesCache";
import useMediaDevicesCapture from "./useMediaDevicesCapture";

import { utils } from "media-stream-track-controller";

export const InputMediaDevicesContext = createContext({});

/**
 * Manages access and user permissions of audio / video input media devices.
 */
export default function InputMediaDevicesProvider({ children }) {
  /** @type {MediaDeviceInfo[]} */
  const [audioInputDevices, _setAudioInputDevices] = useState([]);

  /**
   * Obtains list of available audio input media devices and sets internal hook
   * state.
   *
   * @param {boolean} isAggressive? [default = true]
   * @return {Promise{MediaDeviceInfo[]}}
   */
  const fetchAudioInputDevices = useCallback(async (isAggressive = true) => {
    const audioInputDevices =
      await utils.fetchMediaDevices.fetchAudioInputDevices(isAggressive);

    _setAudioInputDevices(audioInputDevices);

    return audioInputDevices;
  }, []);

  const {
    hasUserAudioPermission,
    setHasUserAudioPermission,

    hasUserVideoPermission,
    setHasUserVideoPermission,

    defaultAudioInputDevices,
    setDefaultAudioInputDevices,

    setAudioInputDeviceConstraints,
    getAudioInputDeviceConstraints,
  } = useAudioInputDevicesCache({
    audioInputDevices,
  });

  const {
    captureMediaDevice,
    captureSpecificMediaDevice,

    audioCaptureDeviceControllers,
    videoCaptureDeviceControllers,
  } = useMediaDevicesCapture();

  return (
    <InputMediaDevicesContext.Provider
      value={{
        fetchAudioInputDevices,
        audioInputDevices,

        // *** Permissions
        hasUserAudioPermission,
        setHasUserAudioPermission,

        hasUserVideoPermission,
        setHasUserVideoPermission,
        // *** /Permissions

        defaultAudioInputDevices,
        setDefaultAudioInputDevices,

        setAudioInputDeviceConstraints,
        getAudioInputDeviceConstraints,

        captureMediaDevice,
        captureSpecificMediaDevice,

        audioCaptureDeviceControllers,
        videoCaptureDeviceControllers,

        getIsMediaDeviceCaptureSupported:
          utils.captureMediaDevice.getIsDeviceMediaCaptureSupported,
      }}
    >
      {children}
    </InputMediaDevicesContext.Provider>
  );
}
