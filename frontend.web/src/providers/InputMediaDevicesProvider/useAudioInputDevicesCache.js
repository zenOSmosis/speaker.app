import PhantomCore from "phantom-core";
import { useCallback, useEffect, useMemo, useState } from "react";
import useObjectState from "@hooks/useObjectState";

import { KEY_LOCAL_AUDIO_INPUT_DEVICES_CACHE } from "@local/localStorageKeys";

import { utils } from "media-stream-track-controller";

import useLocalStorage from "@hooks/useLocalStorage";

/**
 * @typedef {Object} CachedAudioInputDeviceProps
 * @property {Object} mediaDeviceInfo
 * @property {Object} defaultConstraints
 * @property {boolean} isDefaultDevice
 */

// Computed property names representing CachedAudioInputDeviceProps
const KEY_CAIDP_MEDIA_DEVICE_INFO = "mediaDeviceInfo";
const KEY_CAIDP_DEFAULT_CONSTRAINTS = "defaultConstraints";
const KEY_CAIDP_IS_DEFAULT_DEVICE = "isDefaultDevice";

/**
 * Provides local storage caching session persistence for audio input devices.
 *
 * Functionality such as determining default devices and constraints per device
 * are included here.
 *
 * IMPORTANT: This hook should be treated as a singleton (provider based).
 *
 * TODO: Refactor this once video capture devices are used
 *
 * @typedef {Object} AudioInputDeviceProps
 * @property {MediaDeviceInfo[]} audioInputDevices
 */
export default function useAudioInputDevicesCache({ audioInputDevices }) {
  const { getItem: getLocalStorageItem, setItem: setLocalStorageItem } =
    useLocalStorage();

  /**
   * TODO: Document
   */
  const [objectState, setObjectState] = useObjectState(
    // Read from local storage or set cache defaults
    getLocalStorageItem(KEY_LOCAL_AUDIO_INPUT_DEVICES_CACHE) || {
      // audioInputDevices will not be populated on first run, so this will
      // have to default to an empty array

      /** @type {CachedAudioInputDeviceProps[]} */
      allAudioInputDevicesProperties: [],

      hasUserAudioPermission: false,

      hasUserVideoPermission: false,
    }
  );

  const {
    allAudioInputDevicesProperties,
    hasUserAudioPermission,
    hasUserVideoPermission,
  } = useMemo(() => objectState, [objectState]);

  // Cache all updates to objectState back to local storage
  useEffect(() => {
    setLocalStorageItem(KEY_LOCAL_AUDIO_INPUT_DEVICES_CACHE, objectState);
  }, [setLocalStorageItem, objectState]);

  // TODO: Document
  /**
   * Creates a new wrapping object for for caching of audio input device
   * information, but does not actually cache the object itself.
   *
   */
  const _createCachedDeviceProps = useCallback(
    (mediaDeviceInfo, constraints = {}, isDefaultDevice = false) => {
      // TODO: Bring in from media-stream-track-controller
      const DEFAULT_CONSTRAINTS = {};

      const newCachedDeviceProps = {
        [KEY_CAIDP_MEDIA_DEVICE_INFO]: mediaDeviceInfo,
        [KEY_CAIDP_DEFAULT_CONSTRAINTS]: PhantomCore.mergeOptions(
          DEFAULT_CONSTRAINTS,
          constraints
        ),
        [KEY_CAIDP_IS_DEFAULT_DEVICE]: isDefaultDevice,
      };

      /*
      setObjectState(prev => ({
        ...prev,
        allAudioInputDevicesProperties: [
          ...prev.allAudioInputDevicesProperties,
          newCachedDeviceProps,
        ],
      }));
      */

      return newCachedDeviceProps;
    },
    []
  );

  // TODO: Implement
  const _getMatchedCachedDevice = useCallback(mediaDeviceInfo => {
    // TODO: Lookup existing devices from cache
    // TODO: If no match, set cached device
  }, []);

  // TODO: Document
  const _setAudioInputDeviceProperties = useCallback(
    (mediaDeviceInfo, properties) => {
      setObjectState(objectState => {
        // Look up existing device in _allAudioInputDevicesProperties
        // TODO: Rename to clarify single device
        let cachedDeviceProps = objectState.allAudioInputDevicesProperties.find(
          // TODO: Rename deviceCache to clarify single device
          deviceCache =>
            utils.getMediaDeviceMatch.getAudioInputDeviceMatch(
              deviceCache.mediaDeviceInfo,
              audioInputDevices
            )
        );

        if (cachedDeviceProps) {
          // Temporarily remove from state array
          objectState.allAudioInputDevicesProperties.filter(
            // TODO: Rename deviceCache to clarify single device
            deviceCache => !Object.is(cachedDeviceProps, deviceCache)
          );
        } else {
          // Create cached device props
          const { defaultConstraints, isDefaultDevice } = properties;
          cachedDeviceProps = _createCachedDeviceProps(
            mediaDeviceInfo,
            defaultConstraints,
            isDefaultDevice
          );
        }

        objectState.allAudioInputDevicesProperties.AudioInputDevicesCacheProps(
          cachedDeviceProps
        );

        return { ...objectState };
      });
    },
    [_createCachedDeviceProps, audioInputDevices, setObjectState]
  );

  const setHasUserAudioPermission = useState(
    hasUserAudioPermission => {
      setObjectState({
        hasUserAudioPermission,
      });
    },
    [setObjectState]
  );

  const setHasUserVideoPermission = useState(
    hasUserVideoPermission => {
      setObjectState({
        hasUserVideoPermission,
      });
    },
    [setObjectState]
  );

  // TODO: Document
  const setDefaultAudioInputDevices = useCallback(
    defaultAudioInputDevices => {
      if (!Array.isArray(defaultAudioInputDevices)) {
        throw new TypeError("defaultAudioInputDevices must be an array");
      }

      // TODO: Add additional check for MediaDeviceInfo type?

      defaultAudioInputDevices.forEach(device =>
        _setAudioInputDeviceProperties(device, {
          isDefaultDevice: true,
        })
      );
    },
    [_setAudioInputDeviceProperties]
  );

  // TODO: Document
  const setAudioInputDeviceConstraints = useCallback(
    (audioInputDevice, defaultConstraints) =>
      _setAudioInputDeviceProperties(audioInputDevice, {
        defaultConstraints,
      }),
    [_setAudioInputDeviceProperties]
  );

  // TODO: Document
  const getAudioInputDeviceConstraints = useCallback(audioInputDevice => {
    // TODO: Implement
  }, []);

  // TODO: Document
  const defaultAudioInputDevices = useMemo(
    () =>
      allAudioInputDevicesProperties
        .filter(props => props.isDefaultDevice)
        .map(props => props.mediaDeviceInfo),
    [allAudioInputDevicesProperties]
  );

  const getIsDefaultAudioInputDevice = useCallback(mediaDeviceInfo => {
    // TODO: Obtain matched cached device
    // TODO: Return matched cached device isDefault property
  }, []);

  // TODO: Implement ability to set / remove device default constraints (individual)
  // TODO: Implement ability to get per-device default constraints

  return {
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
  };
}
