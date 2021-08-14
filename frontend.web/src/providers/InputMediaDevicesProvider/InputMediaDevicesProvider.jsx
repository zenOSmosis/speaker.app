import { logger } from "phantom-core";
import React, { createContext, useCallback, useEffect, useState } from "react";

import useInputMediaDevicesPermissions from "./useInputMediaDevicesPermissions";
import useInputMediaDevicesCache from "./useInputMediaDevicesCache";
import useSelectedAndTestInputMediaDevices from "./useSelectedAndTestInputMediaDevices";

import { utils } from "media-stream-track-controller";

export const InputMediaDevicesContext = createContext({});

/**
 * Manages access and user permissions of audio / video input media devices.
 */
export default function InputMediaDevicesProvider({ children }) {
  const {
    hasUserAudioPermission,
    setHasUserAudioPermission,

    hasUserVideoPermission,
    setHasUserVideoPermission,
  } = useInputMediaDevicesPermissions();

  /** @type {MediaDeviceInfo[]} */
  const [mediaDevices, _setMediaDevices] = useState([]);

  /**
   * Obtains list of available audio input media devices and sets internal hook
   * state.
   *
   * @param {boolean} isAggressive? [default = true]
   * @return {Promise{MediaDeviceInfo[]}}
   */
  const fetchMediaDevices = useCallback(async (isAggressive = true) => {
    const mediaDevices = await utils.fetchMediaDevices(isAggressive);

    _setMediaDevices(mediaDevices);

    return mediaDevices;
  }, []);

  /**
   * Refetch media devices on device change.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/ondevicechange
   *
   * TODO: Should this onchange handler be proxied so other potential handlers
   * can co-exist?
   */
  useEffect(() => {
    if (navigator && navigator.mediaDevices && navigator.mediaDevices) {
      navigator.mediaDevices.ondevicechange = fetchMediaDevices;

      const _handleDeviceChange = () => {
        // Don't try to refetch if no mediaDevices are already present simply
        // because the first fetch will be an aggressive fetch and we don't
        // necessarily want to prompt the user to accept mic permissions the
        // first time they plug in a device
        if (mediaDevices.length) {
          // FIXME: Use logger.debug once global logger is automatically
          // configured as default log level to run all levels in development
          //
          // @see https://github.com/zenOSmosis/phantom-core/issues/41
          logger.info("Received ondevicechange and refetching media devices");

          fetchMediaDevices();
        }
      };

      navigator.mediaDevices.ondevicechange = _handleDeviceChange;

      return function unmount() {
        navigator.mediaDevices.ondevicechange = () => null;
      };
    }
  }, [mediaDevices, fetchMediaDevices]);

  const [audioInputDevices, _setAudioInputDevices] = useState([]);
  const [videoInputDevices, _setVideoInputDevices] = useState([]);

  // Automatically populate audio/videoInputDevices based on filters used on
  // mediaDevices
  useEffect(() => {
    _setAudioInputDevices(
      utils.fetchMediaDevices.filterAudioInputDevices(mediaDevices)
    );

    _setVideoInputDevices(
      utils.fetchMediaDevices.filterVideoInputDevices(mediaDevices)
    );
  }, [mediaDevices]);

  // TODO: Map selected / testing states to cache
  // TODO: Map initial cache values to selected states
  const {
    defaultAudioInputDevices,
    setDefaultAudioInputDevices,

    setAudioInputDeviceConstraints,
    getAudioInputDeviceConstraints,
  } = useInputMediaDevicesCache({
    mediaDevices,
    hasUserAudioPermission,
    hasUserVideoPermission,
  });

  // TODO: Automatically from selected / test devices any devices which are not
  // currently in the mediaDevices array
  const {
    addSelectedInputMediaDevice,
    removeSelectedInputMediaDevice,

    selectedInputMediaDevices,
    selectedAudioInputDevices,
    selectedVideoInputDevices,

    addTestInputMediaDevice,
    removeTestInputMediaDevice,

    testInputMediaDevices,
    testAudioInputDevices,
    testVideoInputDevices,
  } = useSelectedAndTestInputMediaDevices({ mediaDevices });

  /**
   * FIXME: This is currently written to only return the first track controller
   * associated to the device and might should be renamed / refactored later.
   *
   * @param {MediaDeviceInfo | Object}
   * @return {MediaStreamTrack | void}
   */
  const getInputMediaDeviceMediaStreamTrack = useCallback(mediaDevice => {
    const trackControllers =
      utils.captureMediaDevice.getMediaDeviceTrackControllers(mediaDevice);

    if (trackControllers.length) {
      return trackControllers[0].getOutputMediaStreamTrack();
    }
  }, []);

  return (
    <InputMediaDevicesContext.Provider
      value={{
        // *** Permissions
        hasUserAudioPermission,
        setHasUserAudioPermission,

        hasUserVideoPermission,
        setHasUserVideoPermission,
        // *** /Permissions

        fetchMediaDevices,
        audioInputDevices,
        videoInputDevices,

        // defaultAudioInputDevices,
        // setDefaultAudioInputDevices,

        setAudioInputDeviceConstraints,
        getAudioInputDeviceConstraints,

        addSelectedInputMediaDevice,
        removeSelectedInputMediaDevice,

        addTestInputMediaDevice,
        removeTestInputMediaDevice,

        selectedAudioInputDevices,
        selectedVideoInputDevices,

        testAudioInputDevices,
        testVideoInputDevices,

        // audioCaptureDeviceControllers,
        // videoCaptureDeviceControllers,

        getIsMediaDeviceCaptureSupported:
          utils.captureMediaDevice.getIsDeviceMediaCaptureSupported,

        getInputMediaDeviceMediaStreamTrack,
      }}
    >
      {children}
    </InputMediaDevicesContext.Provider>
  );
}
