import { useCallback, useEffect, useMemo, useState } from "react";
import useObjectState from "@hooks/useObjectState";

import { KEY_LOCAL_AUDIO_INPUT_DEVICES_CACHE } from "@local/localStorageKeys";

import useLocalStorage from "@hooks/useLocalStorage";

/**
 * @typedef {Object} AudioInputDevicesCacheProps
 * @property {MediaDeviceInfo[]} audioInputDevices
 */
export default function useAudioInputDevicesCache({ audioInputDevices }) {
  const { getItem: getLocalStorageItem, setItem: setLocalStorageItem } =
    useLocalStorage();

  /**
   * @typedef {Object} AudioInputDeviceProperties
   * @property {Object} mediaDeviceInfo
   * @property {Object} defaultConstraints
   * @property {boolean} isDefaultDevice
   *
   * TODO: Document
   */
  const [objectState, setObjectState] = useObjectState(
    // Read from local storage or set cache defaults
    getLocalStorageItem(KEY_LOCAL_AUDIO_INPUT_DEVICES_CACHE) || {
      allAudioInputDevicesProperties: [],
    }
  );

  /*
  useEffect(() => {
    // TODO: Match cachedDefaults defaultAudioInputDevice with defaultAudioInputDevice
  }, [audioInputDevices]);
  */

  // Cache all updates to objectState back to local storage
  useEffect(() => {
    setLocalStorageItem(KEY_LOCAL_AUDIO_INPUT_DEVICES_CACHE, objectState);
  }, [setLocalStorageItem, objectState]);

  const { allAudioInputDevicesProperties } = useMemo(
    () => objectState,
    [objectState]
  );

  const _setAudioInputDeviceProperties = useCallback(
    (mediaDeviceInfo, properties) => {
      // TODO: Look up existing device in _allAudioInputDevicesProperties
      // TODO: If not already set, add it
      // TODO: Update with new properties
    },
    []
  );

  const setDefaultAudioInputDevices = useCallback(
    defaultAudioInputDevices =>
      defaultAudioInputDevices.forEach(device =>
        _setAudioInputDeviceProperties(device, {
          isDefaultDevice: true,
        })
      ),
    [_setAudioInputDeviceProperties]
  );

  const setAudioInputDeviceConstraints = useCallback(
    (audioInputDevice, defaultConstraints) =>
      _setAudioInputDeviceProperties(audioInputDevice, {
        defaultConstraints,
      }),
    [_setAudioInputDeviceProperties]
  );

  const getAudioInputDeviceConstraints = useCallback(audioInputDevice => {
    // TODO: Implement
  }, []);

  const defaultAudioInputDevices = useMemo(
    () =>
      allAudioInputDevicesProperties
        .filter(props => props.isDefaultDevice)
        .map(props => props.mediaDeviceInfo),
    [allAudioInputDevicesProperties]
  );

  return {
    defaultAudioInputDevices,
    setDefaultAudioInputDevices,

    setAudioInputDeviceConstraints,
    getAudioInputDeviceConstraints,
  };
}
