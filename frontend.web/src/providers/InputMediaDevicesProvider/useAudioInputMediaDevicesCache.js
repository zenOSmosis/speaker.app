import { useCallback, useEffect, useMemo, useState } from "react";
import PhantomCore from "phantom-core";
import useObjectState from "@hooks/useObjectState";

import { KEY_LOCAL_AUDIO_INPUT_DEVICES_CACHE } from "@local/localStorageKeys";

import useLocalStorage from "@hooks/useLocalStorage";

/**
 * @typedef {Object} AudioInputMediaDevicesCacheProps
 * @property {MediaDeviceInfo[]} audioInputMediaDevices
 */
export default function useAudioInputMediaDevicesCache({
  audioInputMediaDevices,
}) {
  const { getItem: getLocalStorageItem, setItem: setLocalStorageItem } =
    useLocalStorage();

  /**
   * @typedef {Object} AudioInputMediaDeviceProperties
   * @property {Object} mediaDeviceInfo
   * @property {Object} defaultConstraints
   * @property {boolean} isDefaultDevice
   *
   * TODO: Document
   */
  const [objectState, setObjectState] = useObjectState(
    // Read from local storage or set cache defaults
    getLocalStorageItem(KEY_LOCAL_AUDIO_INPUT_DEVICES_CACHE) || {
      allAudioInputMediaDevicesProperties: [],
    }
  );

  /*
  useEffect(() => {
    // TODO: Match cachedDefaults defaultAudioInputMediaDevice with defaultAudioInputMediaDevice
  }, [audioInputMediaDevices]);
  */

  // Cache all updates to objectState back to local storage
  useEffect(() => {
    setLocalStorageItem(KEY_LOCAL_AUDIO_INPUT_DEVICES_CACHE, objectState);
  }, [setLocalStorageItem, objectState]);

  const { allAudioInputMediaDevicesProperties } = useMemo(
    () => objectState,
    [objectState]
  );

  const _setAudioInputMediaDeviceProperties = useCallback(
    (mediaDeviceInfo, properties) => {
      // TODO: Look up existing device in _allAudioInputMediaDevicesProperties
      // TODO: If not already set, add it
      // TODO: Update with new properties
    },
    []
  );

  const setDefaultAudioInputMediaDevices = useCallback(
    defaultAudioInputMediaDevices =>
      defaultAudioInputMediaDevices.forEach(device =>
        _setAudioInputMediaDeviceProperties(device, {
          isDefaultDevice: true,
        })
      ),
    [_setAudioInputMediaDeviceProperties]
  );

  const setAudioInputMediaDeviceConstraints = useCallback(
    (audioInputMediaDevice, defaultConstraints) =>
      _setAudioInputMediaDeviceProperties(audioInputMediaDevice, {
        defaultConstraints,
      }),
    [_setAudioInputMediaDeviceProperties]
  );

  const getAudioInputMediaDeviceConstraints = useCallback(
    audioInputMediaDevice => {
      // TODO: Implement
    },
    []
  );

  const defaultAudioInputMediaDevices = useMemo(
    () =>
      allAudioInputMediaDevicesProperties
        .filter(props => props.isDefaultDevice)
        .map(props => props.mediaDeviceInfo),
    [allAudioInputMediaDevicesProperties]
  );

  return {
    defaultAudioInputMediaDevices,
    setDefaultAudioInputMediaDevices,

    setAudioInputMediaDeviceConstraints,
    getAudioInputMediaDeviceConstraints,
  };
}
