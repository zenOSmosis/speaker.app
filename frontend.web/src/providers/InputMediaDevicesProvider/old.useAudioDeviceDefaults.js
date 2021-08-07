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
        defaultAudioNoiseSuppression: true,
        defaultAudioEchoCancellation: true,
        defaultAudioAutoGainControl: true,
      },
    [getItem]
  );

  const [
    {
      defaultAudioInputDevice,
      defaultAudioNoiseSuppression,
      defaultAudioEchoCancellation,
      defaultAudioAutoGainControl,
    },
    setObjectState,
  ] = useObjectState({
    defaultAudioInputDevice: null,
    defaultAudioNoiseSuppression: cachedDefaults.defaultAudioNoiseSuppression,
    defaultAudioEchoCancellation: cachedDefaults.defaultAudioEchoCancellation,
    defaultAudioAutoGainControl: cachedDefaults.defaultAudioAutoGainControl,
  });

  // Write back changed values to local storage cache
  useEffect(() => {
    setItem(KEY_LOCAL_AUDIO_DEFAULTS, {
      defaultAudioNoiseSuppression,
      defaultAudioEchoCancellation,
      defaultAudioAutoGainControl,
    });
  }, [
    setItem,
    defaultAudioNoiseSuppression,
    defaultAudioEchoCancellation,
    defaultAudioAutoGainControl,
  ]);

  const setDefaultAudioInputDevice = useCallback(
    defaultAudioInputDevice => {
      setObjectState(prev => ({ ...prev, ...{ defaultAudioInputDevice } }));
    },
    [setObjectState]
  );

  const setDefaultAudioNoiseSuppression = useCallback(
    defaultAudioNoiseSuppression => {
      setObjectState(prev => ({
        ...prev,
        ...{ defaultAudioNoiseSuppression },
      }));
    },
    [setObjectState]
  );

  const setDefaultAudioEchoCancellation = useCallback(
    defaultAudioEchoCancellation => {
      setObjectState(prev => ({
        ...prev,
        ...{ defaultAudioEchoCancellation },
      }));
    },
    [setObjectState]
  );

  const setDefaultAudioAutoGainControl = useCallback(
    defaultAudioAutoGainControl => {
      setObjectState(prev => ({
        ...prev,
        ...{ defaultAudioAutoGainControl },
      }));
    },
    [setObjectState]
  );

  return {
    defaultAudioInputDevice,
    setDefaultAudioInputDevice,

    defaultAudioNoiseSuppression,
    setDefaultAudioNoiseSuppression,

    defaultAudioEchoCancellation,
    setDefaultAudioEchoCancellation,

    defaultAudioAutoGainControl,
    setDefaultAudioAutoGainControl,
  };
}
