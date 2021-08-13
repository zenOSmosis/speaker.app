import { useCallback, useEffect, useState } from "react";
import { utils } from "media-stream-track-controller";

/**
 * Maintains the current state of selected and test input devices.
 *
 * NOTE: This hook only maintains internal state and does not touch the cache.
 *
 * IMPORTANT: This hook should be treated as a singleton (provider based).
 */
export default function useSelectedAndTestInputMediaDevices() {
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

  /**
   * Adds the given mediaDeviceInfo to the selected list.
   *
   * @param {MediaDeviceInfo} mediaDeviceInfo
   * @return {void}
   */
  const addSelectedInputMediaDevice = useCallback(mediaDeviceInfo => {
    _setSelectedInputMediaDevices(prev => {
      if (prev.includes(mediaDeviceInfo)) {
        return prev;
      } else {
        const next = [...prev, mediaDeviceInfo];

        return next;
      }
    });
  }, []);

  /**
   * Removes the given mediaDeviceInfo from the selected list.
   *
   * @param {MediaDeviceInfo} mediaDeviceInfo
   * @return {void}
   */
  const removeSelectedInputMediaDevice = useCallback(mediaDeviceInfo => {
    _setSelectedInputMediaDevices(prev => [
      ...prev.filter(testPrev => !Object.is(testPrev, mediaDeviceInfo)),
    ]);
  }, []);

  /**
   * Adds the given mediaDeviceInfo to the test list.
   *
   * @param {MediaDeviceInfo} mediaDeviceInfo
   * @return {void}
   */
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

  /**
   * Removes the given mediaDeviceInfo from the test list.
   *
   * @param {MediaDeviceInfo} mediaDeviceInfo
   * @return {void}
   */
  const removeTestInputMediaDevice = useCallback(mediaDeviceInfo => {
    _setTestInputMediaDevices(prev => [
      ...prev.filter(testPrev => !Object.is(testPrev, mediaDeviceInfo)),
    ]);
  }, []);

  return {
    addSelectedInputMediaDevice,
    removeSelectedInputMediaDevice,

    selectedInputMediaDevices,
    selectedAudioInputDevices,
    selectedVideoInputDevices,

    addTestInputMediaDevice,
    removeTestInputMediaDevice,

    testInputMediaDevices,
    testAudioInputDevices,
    testVideoInputDevices,
  };
}
