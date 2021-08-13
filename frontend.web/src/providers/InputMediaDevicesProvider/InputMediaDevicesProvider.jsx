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
    /** @type {MediaDeviceList[]} */
    const nextMediaDevices = await (async () => {
      /**
       * IMPORTANT: The detectedMediaDevices are not directly written back to
       * the mediaDevices state because the MediaDeviceInfo object elements are
       * unique on subsequent runs. The following code in this function body
       * will remedy that.
       *
       * TODO: Consider moving this handling directly to
       * media-stream-track-controller so implementations don't have to go
       * through this.
       */

      /**
       * The list of currently obtained media devices.
       *
       * @type {MediaDeviceList[]}
       */
      const detectedMediaDevices = await utils.fetchMediaDevices(isAggressive);

      /**
       * This will become what is written back to the mediaDevices state.
       *
       * This original value represents the current state of mediaDevices with
       * removed new devices filtered out.
       *
       * @type {MediaDeviceList[]}
       */
      const next = [...refMediaDevices.current].filter(device =>
        Boolean(
          detectedMediaDevices.find(predicate => {
            const isMatch =
              predicate.kind === device.kind &&
              predicate.deviceId === device.deviceId;

            return isMatch;
          })
        )
      );

      // Add new media devices to the next array
      detectedMediaDevices.forEach(device => {
        const isPrevious = Boolean(
          refMediaDevices.current.find(
            predicate =>
              predicate.kind === device.kind &&
              predicate.deviceId === device.deviceId
          )
        );

        if (!isPrevious) {
          next.push(device);
        }
      });

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
