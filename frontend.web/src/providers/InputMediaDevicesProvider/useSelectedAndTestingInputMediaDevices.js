import { useCallback, useEffect, useState } from "react";
import { utils } from "media-stream-track-controller";

/**
 * Maintains the current state of selected and test input devices.
 *
 * NOTE: This hook also controls the capturing / uncapturing of media devices
 * based on various states of the application.
 *
 * IMPORTANT: This hook should be treated as a singleton (provider based).
 */
export default function useSelectedAndTestingInputMediaDevices({
  mediaDevices,
}) {
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

  const [testingInputMediaDevices, _setTestingInputMediaDevices] = useState([]);
  const [testingAudioInputDevices, _setTestingAudioInputDevices] = useState([]);
  const [testingVideoInputDevices, _setTestingVideoInputDevices] = useState([]);

  // Automatically populate testAudio/VideoInputDevices based on filters used on
  // mediaDevices
  useEffect(() => {
    _setTestingAudioInputDevices(
      utils.fetchMediaDevices.filterAudioInputDevices(testingInputMediaDevices)
    );

    _setTestingVideoInputDevices(
      utils.fetchMediaDevices.filterVideoInputDevices(testingInputMediaDevices)
    );
  }, [testingInputMediaDevices]);

  /**
   * @public
   *
   * Adds the given mediaDeviceInfo to the selected list.
   *
   * NOTE: Duplicate entries are ignored.
   *
   * @param {MediaDeviceInfo} mediaDeviceInfo
   * @return {void}
   */
  const addSelectedInputMediaDevice = useCallback(mediaDeviceInfo => {
    _setSelectedInputMediaDevices(prev => {
      // Don't add duplicates
      if (prev.includes(mediaDeviceInfo)) {
        return prev;
      } else {
        const next = [...prev, mediaDeviceInfo];

        return next;
      }
    });
  }, []);

  /**
   * @public
   *
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
   * @public
   *
   * Adds the given mediaDeviceInfo to the testing list.
   *
   * NOTE: Duplicate entries are ignored.
   *
   * @param {MediaDeviceInfo} mediaDeviceInfo
   * @return {void}
   */
  const addTestingInputMediaDevice = useCallback(mediaDeviceInfo => {
    _setTestingInputMediaDevices(prev => {
      // Don't add duplicates
      if (prev.includes(mediaDeviceInfo)) {
        return prev;
      } else {
        const next = [...prev, mediaDeviceInfo];

        return next;
      }
    });
  }, []);

  /**
   * @public
   *
   * Removes the given mediaDeviceInfo from the testing list.
   *
   * @param {MediaDeviceInfo} mediaDeviceInfo
   * @return {void}
   */
  const removeTestingInputMediaDevice = useCallback(mediaDeviceInfo => {
    _setTestingInputMediaDevices(prev => [
      ...prev.filter(testPrev => !Object.is(testPrev, mediaDeviceInfo)),
    ]);
  }, []);

  return {
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
  };
}
