import { useCallback, useEffect, useMemo } from "react";
import useObjectState from "@hooks/useObjectState";

import { KEY_LOCAL_AUDIO_DEFAULTS } from "@local/localStorageKeys";

import useLocalStorage from "@hooks/useLocalStorage";

export default function useAudioDeviceDefaults() {
  const { getItem, setItem } = useLocalStorage();

  // Obtain default values from local storage cache
  const cachedDefaults = useMemo(
    () =>
      getItem(KEY_LOCAL_AUDIO_DEFAULTS) || {
        defaultIsAudioNoiseSuppression: true,
        defaultIsAudioEchoCancellation: true,
        defaultIsAudioAutoGainControl: true,
      },
    [getItem]
  );

  const [
    {
      defaultAudioInputDevice,
      defaultIsAudioNoiseSuppression,
      defaultIsAudioEchoCancellation,
      defaultIsAudioAutoGainControl,
    },
    setObjectState,
  ] = useObjectState({
    defaultAudioInputDevice: null,
    defaultIsAudioNoiseSuppression:
      cachedDefaults.defaultIsAudioNoiseSuppression,
    defaultIsAudioEchoCancellation:
      cachedDefaults.defaultIsAudioEchoCancellation,
    defaultIsAudioAutoGainControl: cachedDefaults.defaultIsAudioAutoGainControl,
  });

  // Write back changed values to local storage cache
  useEffect(() => {
    setItem(KEY_LOCAL_AUDIO_DEFAULTS, {
      defaultIsAudioNoiseSuppression,
      defaultIsAudioEchoCancellation,
      defaultIsAudioAutoGainControl,
    });
  }, [
    setItem,
    defaultIsAudioNoiseSuppression,
    defaultIsAudioEchoCancellation,
    defaultIsAudioAutoGainControl,
  ]);

  const setDefaultAudioInputDevice = useCallback(
    (defaultAudioInputDevice) => {
      setObjectState((prev) => ({ ...prev, ...{ defaultAudioInputDevice } }));
    },
    [setObjectState]
  );

  const setDefaultIsAudioNoiseSuppression = useCallback(
    (defaultIsAudioNoiseSuppression) => {
      setObjectState((prev) => ({
        ...prev,
        ...{ defaultIsAudioNoiseSuppression },
      }));
    },
    [setObjectState]
  );

  const setDefaultIsAudioEchoCancellation = useCallback(
    (defaultIsAudioEchoCancellation) => {
      setObjectState((prev) => ({
        ...prev,
        ...{ defaultIsAudioEchoCancellation },
      }));
    },
    [setObjectState]
  );

  const setDefaultIsAudioAutoGainControl = useCallback(
    (defaultIsAudioAutoGainControl) => {
      setObjectState((prev) => ({
        ...prev,
        ...{ defaultIsAudioAutoGainControl },
      }));
    },
    [setObjectState]
  );

  return {
    defaultAudioInputDevice,
    setDefaultAudioInputDevice,

    defaultIsAudioNoiseSuppression,
    setDefaultIsAudioNoiseSuppression,

    defaultIsAudioEchoCancellation,
    setDefaultIsAudioEchoCancellation,

    defaultIsAudioAutoGainControl,
    setDefaultIsAudioAutoGainControl,
  };
}
