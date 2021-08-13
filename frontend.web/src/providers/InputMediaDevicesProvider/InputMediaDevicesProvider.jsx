import { logger } from "phantom-core";
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import useAudioInputDevicesCache from "./useAudioInputDevicesCache";
import useMediaDevicesCapture from "./useMediaDevicesCapture";

import { utils } from "media-stream-track-controller";

export const InputMediaDevicesContext = createContext({});

/**
 * Manages access and user permissions of audio / video input media devices.
 */
export default function InputMediaDevicesProvider({ children }) {
  /** @type {MediaDeviceInfo[]} */
  const [mediaDevices, _setMediaDevices] = useState([]);
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

  const [selectedInputMediaDevices, _setSelectedInputMediaDevices] = useState(
    []
  );
  const [selectedAudioInputDevices, _setSelectedAudioInputDevices] = useState(
    []
  );
  const [selectedVideoInputDevices, _setSelectedVideoInputDevices] = useState(
    []
  );

  // Automatically populate selectedAudio/VideoInputDevices based on filters used on
  // mediaDevices
  useEffect(() => {
    _setSelectedAudioInputDevices(
      utils.fetchMediaDevices.filterAudioInputDevices(selectedInputMediaDevices)
    );

    _setSelectedVideoInputDevices(
      utils.fetchMediaDevices.filterVideoInputDevices(selectedInputMediaDevices)
    );
  }, [selectedInputMediaDevices]);

  const [testInputMediaDevices, _setTestInputMediaDevices] = useState([]);
  const [testAudioInputDevices, _setTestAudioInputDevices] = useState([]);
  const [testVideoInputDevices, _setTestVideoInputDevices] = useState([]);

  // Automatically populate testAudio/VideoInputDevices based on filters used on
  // mediaDevices
  useEffect(() => {
    _setTestAudioInputDevices(
      utils.fetchMediaDevices.filterAudioInputDevices(testInputMediaDevices)
    );

    _setTestVideoInputDevices(
      utils.fetchMediaDevices.filterVideoInputDevices(testInputMediaDevices)
    );
  }, [testInputMediaDevices]);

  // TODO: Automatically filter selectedInputMediaDevices and testInputMediaDevices based on audioInputDevices
  /*
  useEffect(() => {
  }, [])
  */

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

  // TODO: Document
  const addSelectedInputMediaDevice = useCallback(mediaDeviceInfo => {
    // TODO: Store in cache

    _setSelectedInputMediaDevices(prev => {
      if (prev.includes(mediaDeviceInfo)) {
        return prev;
      } else {
        const next = [...prev, mediaDeviceInfo];

        return next;
      }
    });
  }, []);

  // TODO: Document
  const removeSelectedInputMediaDevice = useCallback(mediaDeviceInfo => {
    // TODO: Remove from cache

    _setSelectedInputMediaDevices(prev => [
      ...prev.filter(testPrev => !Object.is(testPrev, mediaDeviceInfo)),
    ]);
  }, []);

  // TODO: Document
  const addTestInputMediaDevice = useCallback(mediaDeviceInfo => {
    _setTestInputMediaDevices(prev => {
      if (prev.includes(mediaDeviceInfo)) {
        return prev;
      } else {
        const next = [...prev, mediaDeviceInfo];

        return next;
      }
    });
  }, []);

  // TODO: Document
  const removeTestInputMediaDevice = useCallback(mediaDeviceInfo => {
    _setTestInputMediaDevices(prev => [
      ...prev.filter(testPrev => !Object.is(testPrev, mediaDeviceInfo)),
    ]);
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
    uncaptureSpecificMediaDevice,

    audioCaptureDeviceControllers,
    videoCaptureDeviceControllers,
  } = useMediaDevicesCapture();

  return (
    <InputMediaDevicesContext.Provider
      value={{
        fetchMediaDevices,
        audioInputDevices,

        // *** Permissions
        hasUserAudioPermission,
        setHasUserAudioPermission,

        hasUserVideoPermission,
        setHasUserVideoPermission,
        // *** /Permissions

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
