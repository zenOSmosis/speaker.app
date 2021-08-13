import { logger } from "phantom-core";
import React, { createContext, useCallback, useEffect, useState } from "react";

import useAudioInputDevicesCache from "./useAudioInputDevicesCache";
import useMediaDevicesCapture from "./useMediaDevicesCapture";
import useSelectedAndTestInputMediaDevices from "./useSelectedAndTestInputMediaDevices";

import { utils } from "media-stream-track-controller";

export const InputMediaDevicesContext = createContext({});

/**
 * Manages access and user permissions of audio / video input media devices.
 */
export default function InputMediaDevicesProvider({ children }) {
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
  } = useSelectedAndTestInputMediaDevices();

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

  // TODO: Automatically capture / uncapture depending on current selected / test states
  const {
    captureMediaDevice,
    captureSpecificMediaDevice,
    uncaptureSpecificMediaDevice,

    audioCaptureDeviceControllers,
    videoCaptureDeviceControllers,
  } = useMediaDevicesCapture();

  // Dynamically capture / uncapture media devices based on selected and
  // testing states
  useEffect(() => {
    for (const device of mediaDevices) {
      try {
        if (device.deviceId) {
          const isSelected = selectedInputMediaDevices.includes(device);
          const isTesting = testInputMediaDevices.includes(device);

          const isCurrentlyCapturing =
            utils.captureMediaDevice.getIsMediaDeviceBeingCaptured(device);

          if ((isSelected || isTesting) && !isCurrentlyCapturing) {
            // Start capturing
            //
            // TODO: Map constraints
            utils.captureMediaDevice
              .captureSpecificMediaDevice(device)
              .then(trackControllerFactory => {
                if (isSelected) {
                  const trackControllers =
                    trackControllerFactory.getTrackControllers();

                  for (const controller of trackControllers) {
                    // TODO: Add track controller to current published tracks

                    // TODO: Remove
                    console.log({
                      addPublishedTrackController: controller,
                    });
                  }
                }
              });
          } else if (!isSelected && !isTesting && isCurrentlyCapturing) {
            utils.captureMediaDevice
              .getMediaDeviceTrackControllers(device)
              .forEach(trackController => {
                // TODO: Remove track controller from current published tracks

                // TODO: Remove
                console.log({
                  removePublishedTrackController: trackController,
                });
              });

            // Stop capturing
            utils.captureMediaDevice.uncaptureSpecificMediaDevice(device);
          }
        }
      } catch (err) {
        logger.error(err);
      }
    }
  }, [mediaDevices, selectedInputMediaDevices, testInputMediaDevices]);

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

        // captureMediaDevice,
        // captureSpecificMediaDevice,
        // uncaptureSpecificMediaDevice,

        // audioCaptureDeviceControllers,
        // videoCaptureDeviceControllers,

        getIsMediaDeviceCaptureSupported:
          utils.captureMediaDevice.getIsDeviceMediaCaptureSupported,
      }}
    >
      {children}
    </InputMediaDevicesContext.Provider>
  );
}
