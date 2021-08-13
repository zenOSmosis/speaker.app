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
  // IMPORTANT: This useRef is utilized to fix an infinite loop in
  // implementations which were triggered by the mediaDevices being updated on
  // each run and used internally
  const refMediaDevices = useRef(mediaDevices);
  refMediaDevices.current = mediaDevices;
  const fetchMediaDevices = useCallback(async (isAggressive = true) => {
    const nextMediaDevices = await (async () => {
      let next = await utils.fetchMediaDevices(isAggressive);

      // Remove from predicate where existing media devices are not found
      //
      // TODO: This seems to work as intended, but I'm not exactly sure why
      // it's working
      next = next.filter(
        predicate =>
          !Boolean(
            refMediaDevices.current.find(
              xPredicate =>
                xPredicate.kind === predicate.kind &&
                xPredicate.deviceId === predicate.deviceId
            )
          )
      );

      // Re-use previous MediaDeviceInfo descriptors instead of using the next
      // ones (fixes issue where hooks would update with latest component and
      // lose related state)
      refMediaDevices.current.forEach(device => {
        const isPrevious = Boolean(
          next.find(
            predicate =>
              predicate.kind === device.kind &&
              predicate.deviceId === device.deviceId
          )
        );

        if (!isPrevious) {
          next.push(device);
        }
      });

      // TODO: Fix issue where unplugging media device and refreshing retains it in the list

      return next;
    })();

    _setMediaDevices(nextMediaDevices);

    return nextMediaDevices;
  }, []);

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
