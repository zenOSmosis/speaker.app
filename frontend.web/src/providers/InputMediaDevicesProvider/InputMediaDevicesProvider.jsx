import { logger, PhantomCollection } from "phantom-core";
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import useInputMediaDevicesPermissions from "./useInputMediaDevicesPermissions";
import useInputMediaDevicesCache from "./useInputMediaDevicesCache";
import useInputMediaDevicesFactories from "./useInputMediaDevicesFactories";
import usePublishableTrackControllerCollections from "./usePublishableTrackControllerCollections";
import useSelectedAndTestingInputMediaDevices from "./useSelectedAndTestingInputMediaDevices";

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

  // These states are used in determination of whether to start / stop media devices
  const [isAudioSelectorRendered, setIsAudioSelectorRendered] = useState(false);
  const [isInCall, setIsInCall] = useState(false);

  /** @type {MediaDeviceInfo[]} */
  const [inputMediaDevices, _setInputMediaDevices] = useState([]);

  /**
   * Obtains list of available audio input media devices and sets internal hook
   * state.
   *
   * @param {boolean} isAggressive? [default = true]
   * @return {Promise<MediaDeviceInfo[]>}
   */
  const fetchMediaDevices = useCallback(
    async (isAggressive = true) => {
      const prev = inputMediaDevices;

      const next = await utils.fetchMediaDevices(isAggressive);

      const { added, removed } = PhantomCollection.getChildrenDiff(prev, next);

      if (added.length || removed.length) {
        _setInputMediaDevices(next);
      }

      return next;
    },
    [inputMediaDevices]
  );

  /**
   * Refetch media devices on device change.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/ondevicechange
   */
  useEffect(() => {
    if (navigator && navigator.mediaDevices && navigator.mediaDevices) {
      navigator.mediaDevices.ondevicechange = fetchMediaDevices;

      // FIXME: Safari runs this whenever a device is activated, while Chrome
      // does not; provisions have been put in place so this shouldn't make a
      // huge difference but I am not sure if it may still be causing problems
      const _handleDeviceChange = evt => {
        // Don't try to refetch if no mediaDevices are already present simply
        // because the first fetch will be an aggressive fetch and we don't
        // necessarily want to prompt the user to accept mic permissions the
        // first time they plug in a device
        if (inputMediaDevices.length) {
          // FIXME: Use logger.debug once global logger is automatically
          // configured as default log level to run all levels in development
          //
          // @see https://github.com/zenOSmosis/phantom-core/issues/41
          logger.info(
            "Received devicechange event; proceeding to re-fetch media devices"
          );

          fetchMediaDevices();
        }
      };

      navigator.mediaDevices.addEventListener(
        "devicechange",
        _handleDeviceChange
      );

      return function unmount() {
        navigator.mediaDevices.removeEventListener(
          "devicechange",
          _handleDeviceChange
        );
      };
    }
  }, [inputMediaDevices, fetchMediaDevices]);

  const [audioInputDevices, _setAudioInputDevices] = useState([]);
  const [videoInputDevices, _setVideoInputDevices] = useState([]);

  // Automatically populate audio/videoInputDevices based on filters used on
  // inputMediaDevices
  useEffect(() => {
    _setAudioInputDevices(
      utils.fetchMediaDevices.filterAudioInputDevices(inputMediaDevices)
    );

    _setVideoInputDevices(
      utils.fetchMediaDevices.filterVideoInputDevices(inputMediaDevices)
    );
  }, [inputMediaDevices]);

  // TODO: Map selected / testing states to cache
  // TODO: Map initial cache values to selected states
  const {
    // defaultAudioInputDevices,
    // setDefaultAudioInputDevices,

    setAudioInputDeviceConstraints,
    getAudioInputDeviceConstraints,
  } = useInputMediaDevicesCache({
    inputMediaDevices,
    hasUserAudioPermission,
    hasUserVideoPermission,
  });

  // TODO: Automatically from selected / test devices any devices which are not
  // currently in the inputMediaDevices array
  const {
    addSelectedInputMediaDevice,
    removeSelectedInputMediaDevice,

    selectedInputMediaDevices,
    selectedAudioInputDevices,
    selectedVideoInputDevices,

    addTestingInputMediaDevice,
    removeTestingInputMediaDevice,

    testingInputMediaDevices,
    testingAudioInputDevices,
    testingVideoInputDevices,
  } = useSelectedAndTestingInputMediaDevices({ inputMediaDevices });

  const { inputMediaDevicesFactories, allAudioInputMediaStreamTracks } =
    useInputMediaDevicesFactories({
      isInCall,
      isAudioSelectorRendered,

      selectedInputMediaDevices,
      testingInputMediaDevices,

      removeSelectedInputMediaDevice,
      removeTestingInputMediaDevice,
    });

  const {
    publishableAudioInputControllerCollection,
    publishableVideoInputControllerCollection,

    publishableAudioInputTrackControllers,
    publishableVideoInputTrackControllers,
  } = usePublishableTrackControllerCollections({
    isInCall,
    isAudioSelectorRendered,

    selectedInputMediaDevices,
    inputMediaDevicesFactories,
  });

  // TODO: Rename and refactor
  // Temporarily here to just get mic audio working again when call starts
  // IMPORANT: useRef is used here to fix issue with mic continuously re-starting
  const refInputMediaDevices = useRef(inputMediaDevices);
  refInputMediaDevices.current = inputMediaDevices;
  const getPublishableDefaultAudioInputDevice = useCallback(async () => {
    let nextMediaDevices = [];

    if (!refInputMediaDevices.current.length) {
      nextMediaDevices = await fetchMediaDevices();
    }

    const defaultAudioInputDevice = [
      ...nextMediaDevices,
      ...refInputMediaDevices.current,
    ].find(device => device.kind === "audioinput");

    addSelectedInputMediaDevice(defaultAudioInputDevice);
  }, [fetchMediaDevices, addSelectedInputMediaDevice]);

  /**
   * Retrieves associated audio media stream tracks for the given MediaDevice.
   *
   * @param {MediaDeviceInfo | Object}
   * @return {MediaStreamTrack[]}
   */
  const getAudioInputDeviceMediaStreamTracks = useCallback(mediaDevice => {
    const trackControllers =
      utils.captureMediaDevice.getMediaDeviceTrackControllers(mediaDevice);

    return (trackControllers || [])
      .filter(controller => controller.getKind() === "audio")
      .map(controller => controller.getOutputMediaStreamTrack());
  }, []);

  return (
    <InputMediaDevicesContext.Provider
      value={{
        getIsMediaDeviceCaptureSupported:
          utils.captureMediaDevice.getIsDeviceMediaCaptureSupported,

        // *** Permissions
        hasUserAudioPermission,
        setHasUserAudioPermission,

        hasUserVideoPermission,
        setHasUserVideoPermission,
        // *** /Permissions

        fetchMediaDevices,
        audioInputDevices,
        videoInputDevices,

        setAudioInputDeviceConstraints,
        getAudioInputDeviceConstraints,

        addSelectedInputMediaDevice,
        removeSelectedInputMediaDevice,

        addTestingInputMediaDevice,
        removeTestingInputMediaDevice,

        selectedAudioInputDevices,
        selectedVideoInputDevices,

        testingAudioInputDevices,
        testingVideoInputDevices,

        getPublishableDefaultAudioInputDevice,

        publishableAudioInputControllerCollection,
        publishableVideoInputControllerCollection,

        allAudioInputMediaStreamTracks,

        publishableAudioInputTrackControllers,
        publishableVideoInputTrackControllers,

        getAudioInputDeviceMediaStreamTracks,

        setIsAudioSelectorRendered,
        setIsInCall,
      }}
    >
      {children}
    </InputMediaDevicesContext.Provider>
  );
}
