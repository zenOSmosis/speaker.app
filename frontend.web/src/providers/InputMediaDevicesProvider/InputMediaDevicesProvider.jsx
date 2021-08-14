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
  } = useSelectedAndTestInputMediaDevices();

  // Dynamically capture / uncapture media devices based on selected and
  // testing states
  useEffect(() => {
    for (const device of mediaDevices) {
      try {
        // FIXME: This deviceId check is here to fix an issue where deviceId
        // for videoinput could be empty for default device, even after doing
        // an aggressive fetch.  Should we do additional filtering in the
        // media-stream-track-controller fetchMediaDevices utility instead?
        if (device.deviceId.length) {
          const isSelected = selectedInputMediaDevices.includes(device);
          const isTesting = testInputMediaDevices.includes(device);

          const isCurrentlyCapturing =
            utils.captureMediaDevice.getIsMediaDeviceBeingCaptured(device);

          if ((isSelected || isTesting) && !isCurrentlyCapturing) {
            // Start capturing
            utils.captureMediaDevice
              // TODO: Map constraints to device
              .captureSpecificMediaDevice(device)
              .catch(err => {
                // Since there is a problem with capturing, remove this device
                // from the selected / test states
                removeSelectedInputMediaDevice(device);
                removeTestInputMediaDevice(device);

                // TODO: Either add this error to the hook's state or just
                // re-throw it so we can catch it w/ the error boundary?
                console.error(err);
              })
              .then(trackControllerFactory => {
                // FIXME: This additional check for trackControllerFactory is
                // due to an issue in Firefox where when selecting multiple
                // audio devices where the trackControllerFactory is not
                // present here.  Not exactly sure of the reason behind it, or
                // if it's a potential bug in media-stream-track-controller
                if (isSelected && trackControllerFactory) {
                  const trackControllers =
                    trackControllerFactory.getTrackControllers();

                  for (const controller of trackControllers) {
                    // TODO: Add track controller to current published tracks

                    // TODO: Remove
                    console.log({
                      addPublishedTrackController: controller,
                      addDeviceId: controller.getInputDeviceId(),
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
                  removeDeviceId: trackController.getInputDeviceId(),
                });
              });

            // Stop capturing
            utils.captureMediaDevice.uncaptureSpecificMediaDevice(device);
            removeSelectedInputMediaDevice(device);
            removeTestInputMediaDevice(device);
          }
        }
      } catch (err) {
        logger.error(err);
      }
    }
  }, [
    mediaDevices,
    selectedInputMediaDevices,
    testInputMediaDevices,
    removeSelectedInputMediaDevice,
    removeTestInputMediaDevice,
  ]);

  /**
   * FIXME: This is currently written to only return the first track controller
   * associated to the device and might should be renamed / refactored later.
   *
   * @param {MediaDeviceInfo | Object}
   * @return {MediaStreamTrack | []}
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
