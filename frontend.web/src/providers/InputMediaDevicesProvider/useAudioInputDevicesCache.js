import { useCallback, useEffect, useMemo, useState } from "react";
import useObjectState from "@hooks/useObjectState";

import { KEY_LOCAL_AUDIO_INPUT_DEVICES_CACHE } from "@local/localStorageKeys";

import { utils } from "media-stream-track-controller";

import useLocalStorage from "@hooks/useLocalStorage";

/**
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
   * @typedef {Object} CachedAudioInputDeviceProps
   * @property {Object} mediaDeviceInfo
   * @property {Object} defaultConstraints
   * @property {boolean} isDefaultDevice
   *
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
  const _addCachedDevice = useCallback(
    (mediaDeviceInfo, defaultConstraints = {}, isDefaultDevice = false) => {
      const newCachedDeviceProps = {
        mediaDeviceInfo,
        defaultConstraints,
        isDefaultDevice,
      };

      setObjectState(prev => ({
        ...prev,
        allAudioInputDevicesProperties: [
          ...prev.allAudioInputDevicesProperties,
          newCachedDeviceProps,
        ],
      }));
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
          // TODO: Refactor creation into separate function
          cachedDeviceProps = {
            mediaDeviceInfo,

            defaultConstraints: {},

            isDefaultDevice: false,
          };
        }

        objectState.allAudioInputDevicesProperties.AudioInputDevicesCacheProps(
          cachedDeviceProps
        );

        return { ...objectState };
      });
    },
    [audioInputDevices, setObjectState]
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
