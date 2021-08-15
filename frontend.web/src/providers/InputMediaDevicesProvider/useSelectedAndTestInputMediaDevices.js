import { logger } from "phantom-core";
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
export default function useSelectedAndTestInputMediaDevices({ mediaDevices }) {
  // These states are used in determination of whether to start / stop media devices
  const [isAudioSelectorRendered, setIsAudioSelectorRendered] = useState(false);
  const [isInCall, setIsInCall] = useState(false);

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
   * @public
   *
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
   * @public
   *
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

  // Track controllers which represent selected input media devices
  //
  // TODO: Document a bit better
  const [
    publishableInputMediaDeviceTrackControllers,
    _setPublishableTrackControllers,
  ] = useState([]);
  const [
    publishableInputAudioTrackControllers,
    _setPublishableAudioTrackControllers,
  ] = useState([]);
  const [
    publishableInputVideoTrackControllers,
    _setPublishableVideoTrackControllers,
  ] = useState([]);

  // Auto-populates publishable audio / video track controllers based on "kind"
  // determination from iterated track controllers
  useEffect(() => {
    const audioControllers = [];
    const videoControllers = [];

    for (const controller of publishableInputMediaDeviceTrackControllers) {
      const kind = controller.getKind();

      switch (kind) {
        case "audio":
          audioControllers.push(controller);
          break;

        case "video":
          videoControllers.push(controller);
          break;

        default:
          throw new TypeError(`Unknown track controller kind: ${kind}`);
      }
    }

    _setPublishableAudioTrackControllers(audioControllers);
    _setPublishableVideoTrackControllers(videoControllers);
  }, [publishableInputMediaDeviceTrackControllers]);

  /**
   * @private
   *
   * Adds a publishable track controller to the current state.
   *
   * @param {MediaStreamTrackControllerBase}
   * @return {void}
   */
  const _addPublishableTrackController = useCallback(
    trackController => {
      _setPublishableTrackControllers(prev => {
        const next = [...prev];

        // Skip adding if already present
        const isExisting = prev.find(predicate =>
          Object.is(predicate, trackController)
        );

        if (!isExisting) {
          next.push(trackController);
        } else {
          logger.warn(
            "trackController is already in publishable state",
            trackController
          );
        }

        return next;
      });
    },
    [_setPublishableTrackControllers]
  );

  /**
   * @private
   *
   * Removes a publishable track controller from the current state.
   *
   * @param {MediaStreamTrackControllerBase}
   * @return {void}
   */
  const _removePublishableTrackController = useCallback(trackController => {
    _setPublishableTrackControllers(prev =>
      [...prev].filter(predicate => !Object.is(predicate, trackController))
    );
  }, []);

  // TODO: Fix issue where selecting two audio devices for broadcasting will create three audio controllers
  //
  // Dynamically capture / uncapture media devices based on selected and
  // testing states
  useEffect(() => {
    for (const device of mediaDevices) {
      try {
        // FIXME: This deviceId check is here to fix an issue where deviceId
        // for videoinput could be empty for default device, even after doing
        // an aggressive fetch.  Should we do additional filtering in the
        // media-stream-track-controller fetchMediaDevices utility instead?
        if (device.deviceId.length) {
          const isSelected = selectedInputMediaDevices.includes(device);
          const isTesting = testInputMediaDevices.includes(device);

          const isCurrentlyCapturing =
            utils.captureMediaDevice.getIsMediaDeviceBeingCaptured(device);

          if (
            (isAudioSelectorRendered || isInCall) &&
            (isSelected || isTesting) &&
            !isCurrentlyCapturing
          ) {
            // Start capturing
            utils.captureMediaDevice
              // TODO: Map constraints to device
              .captureSpecificMediaDevice(device)
              .catch(err => {
                // Since there is a problem with capturing, remove this device
                // from the selected / test states
                removeSelectedInputMediaDevice(device);
                removeTestInputMediaDevice(device);

                // TODO: Either add this error to the hook's state or just
                // re-throw it so we can catch it w/ the error boundary?
                console.error(err);
              })
              .then(trackControllerFactory => {
                // FIXME: This additional check for trackControllerFactory is
                // due to an issue in Firefox where when selecting multiple
                // audio devices where the trackControllerFactory is not
                // present here.  Not exactly sure of the reason behind it, or
                // if it's a potential bug in media-stream-track-controller
                if (isSelected && trackControllerFactory) {
                  const trackControllers =
                    trackControllerFactory.getTrackControllers();

                  for (const controller of trackControllers) {
                    _addPublishableTrackController(controller);

                    // TODO: Remove
                    console.log({
                      addPublishedTrackController: controller,
                      addDeviceId: controller.getInputDeviceId(),
                    });
                  }
                }
              });
          } else if (!isSelected && !isTesting && isCurrentlyCapturing) {
            utils.captureMediaDevice
              .getMediaDeviceTrackControllers(device)
              .forEach(controller => {
                _removePublishableTrackController(controller);

                // TODO: Remove
                console.log({
                  removePublishedTrackController: controller,
                  removeDeviceId: controller.getInputDeviceId(),
                });
              });

            // Stop capturing
            utils.captureMediaDevice.uncaptureSpecificMediaDevice(device);
            removeSelectedInputMediaDevice(device);
            removeTestInputMediaDevice(device);
          }
        }
      } catch (err) {
        logger.error(err);
      }
    }
  }, [
    mediaDevices,
    selectedInputMediaDevices,
    testInputMediaDevices,
    removeSelectedInputMediaDevice,
    removeTestInputMediaDevice,
    isInCall,
    isAudioSelectorRendered,
    _addPublishableTrackController,
    _removePublishableTrackController,
  ]);

  // TODO: Remove
  console.log({
    publishableInputMediaDeviceTrackControllers,
    publishableInputAudioTrackControllers,
    publishableInputVideoTrackControllers,
  });

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

    publishableInputMediaDeviceTrackControllers,
    publishableInputAudioTrackControllers,
    publishableInputVideoTrackControllers,

    // TODO: Expose single factory which represents all publishableInputMediaDevices

    setIsAudioSelectorRendered,
    setIsInCall,
  };
}
