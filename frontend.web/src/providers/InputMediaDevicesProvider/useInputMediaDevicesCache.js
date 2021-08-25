import PhantomCore from "phantom-core";
import { useCallback, useEffect, useMemo } from "react";
import useObjectState from "@hooks/useObjectState";

import { KEY_LOCAL_AUDIO_INPUT_DEVICES_CACHE } from "@local/localStorageKeys";

import { utils } from "media-stream-track-controller";

import useLocalStorage from "@hooks/useLocalStorage";

/**
 * Per-device cached properties
 *
 * @typedef {Object} CachedInputMediaDeviceProps
 * @property {Object} mediaDeviceInfo
 * @property {Object} defaultConstraints
 * @property {boolean} isDefaultDevice Maps to selected devices from InputMediaDevicesProvider
 */

// Computed property names representing CachedInputMediaDeviceProps
const KEY_CAIDP_MEDIA_DEVICE_INFO = "mediaDeviceInfo";
const KEY_CAIDP_DEFAULT_CONSTRAINTS = "defaultConstraints";
const KEY_CAIDP_IS_DEFAULT_DEVICE = "isDefaultDevice";

/**
 * TODO: Refactor w/ output media devices considered
 *
 * Provides local storage caching session persistence for input media devices.
 *
 * Functionality such as determining default devices and constraints per device
 * are included here.
 *
 * IMPORTANT: This hook should be treated as a singleton (provider based).
 *
 * @typedef {Object} InputMediaDevicesCacheProps
 * @property {MediaDeviceInfo[]} inputMediaDevices
 * @property {boolean} hasUserAudioPermission
 * @property {boolean} hasUserVideoPermission
 *
 * @param {InputMediaDevicesCacheProps} params
 * @return {Object} TODO: Document
 */
export default function useInputMediaDevicesCache({
  inputMediaDevices,
  hasUserAudioPermission,
  hasUserVideoPermission,
}) {
  // Enforce prop type checking
  useEffect(() => {
    if (!Array.isArray(inputMediaDevices)) {
      throw new TypeError("inputMediaDevices is not an array");
    }

    if (typeof hasUserAudioPermission !== "boolean") {
      throw new TypeError("hasUserAudioPermission is not a boolean");
    }

    if (typeof hasUserVideoPermission !== "boolean") {
      throw new TypeError("hasUserVideoPermission is not a boolean");
    }
  }, [inputMediaDevices, hasUserAudioPermission, hasUserVideoPermission]);

  const { getItem: getLocalStorageItem, setItem: setLocalStorageItem } =
    useLocalStorage();

  /**
   * TODO: Document
   */
  const [objectState, setObjectState] = useObjectState(
    /* || */ {
      // inputMediaDevices will not be populated on first run, so this will
      // have to default to an empty array

      /** @type {CachedInputMediaDeviceProps[]} */
      allCachedInputMediaDeviceProps: [],

      // TODO: Add in via InputMediaDevicesCacheProps properties
      cachedHasUserAudioPermission: false,
      cachedHasUserVideoPermission: false,
    }
  );

  // Read from local storage and set cache defaults
  useEffect(() => {
    const defaultCache = getLocalStorageItem(
      KEY_LOCAL_AUDIO_INPUT_DEVICES_CACHE
    );

    if (defaultCache && Object.keys(defaultCache).length) {
      setObjectState(defaultCache);
    }
  }, [getLocalStorageItem, setObjectState]);

  const {
    allCachedInputMediaDeviceProps,
    cachedHasUserAudioPermission,
    cachedHasUserVideoPermission,
  } = useMemo(() => objectState, [objectState]);

  // Write objectState to localStorage, on every update
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
        allCachedInputMediaDeviceProps: [
          ...prev.allCachedInputMediaDeviceProps,
          newCachedDeviceProps,
        ],
      }));
      */

      return newCachedDeviceProps;
    },
    []
  );

  // TODO: Implement
  /*
  const _getMatchedCachedDevice = useCallback(mediaDeviceInfo => {
    // TODO: Lookup existing devices from cache
    // TODO: If no match, add cached device and return it
  }, []);
  */

  // TODO: Document
  const _setCachedInputMediaDeviceProps = useCallback(
    (mediaDeviceInfo, properties) => {
      setObjectState(objectState => {
        // Look up existing device in _allCachedInputMediaDeviceProps
        // TODO: Rename to clarify single device
        let cachedDeviceProps = objectState.allCachedInputMediaDeviceProps.find(
          // TODO: Rename deviceCache to clarify single device
          deviceCache =>
            utils.getMediaDeviceMatch.getAudioInputDeviceMatch(
              deviceCache.mediaDeviceInfo,
              inputMediaDevices
            )
        );

        if (cachedDeviceProps) {
          // Temporarily remove from state array
          objectState.allCachedInputMediaDeviceProps.filter(
            // TODO: Rename deviceCache to clarify single device
            deviceCache => !Object.is(cachedDeviceProps, deviceCache)
          );
        } else {
          // Create cached device props
          const {
            [KEY_CAIDP_DEFAULT_CONSTRAINTS]: defaultConstraints,
            [KEY_CAIDP_IS_DEFAULT_DEVICE]: isDefaultDevice,
          } = properties;
          cachedDeviceProps = _createCachedDeviceProps(
            mediaDeviceInfo,
            defaultConstraints,
            isDefaultDevice
          );
        }

        objectState.allCachedInputMediaDeviceProps.AudioInputDevicesCacheProps(
          cachedDeviceProps
        );

        return { ...objectState };
      });
    },
    [_createCachedDeviceProps, inputMediaDevices, setObjectState]
  );

  // TODO: Document
  const setDefaultInputMediaDevices = useCallback(
    defaultInputMediaDevices => {
      if (!Array.isArray(defaultInputMediaDevices)) {
        throw new TypeError("defaultInputMediaDevices must be an array");
      }

      // TODO: Add additional check for MediaDeviceInfo type?

      defaultInputMediaDevices.forEach(device =>
        _setCachedInputMediaDeviceProps(device, {
          isDefaultDevice: true,
        })
      );
    },
    [_setCachedInputMediaDeviceProps]
  );

  // TODO: Document
  const setCachedInputMediaDeviceConstraints = useCallback(
    (audioInputDevice, defaultConstraints) =>
      _setCachedInputMediaDeviceProps(audioInputDevice, {
        defaultConstraints,
      }),
    [_setCachedInputMediaDeviceProps]
  );

  // TODO: Document
  const getCachedInputMediaDeviceConstraints = useCallback(audioInputDevice => {
    // TODO: Implement
  }, []);

  // TODO: Document
  const defaultInputMediaDevices = useMemo(
    () =>
      allCachedInputMediaDeviceProps
        .filter(props => props.isDefaultDevice)
        .map(props => props.mediaDeviceInfo),
    [allCachedInputMediaDeviceProps]
  );

  const getIsDefaultInputMediaDevice = useCallback(mediaDeviceInfo => {
    // TODO: Obtain matched cached device
    // TODO: Return matched cached device isDefault property
  }, []);

  // TODO: Implement ability to set / remove device default constraints (individual)
  // TODO: Implement ability to get per-device default constraints

  return {
    cachedHasUserAudioPermission,
    cachedHasUserVideoPermission,

    defaultInputMediaDevices,
    setDefaultInputMediaDevices,

    setCachedInputMediaDeviceConstraints,
    getCachedInputMediaDeviceConstraints,
  };
}
