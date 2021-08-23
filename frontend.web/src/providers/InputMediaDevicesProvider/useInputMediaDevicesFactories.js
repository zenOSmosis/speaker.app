import { PhantomCollection, logger } from "phantom-core";
import { useCallback, useEffect, useState } from "react";
import {
  MediaStreamTrackControllerFactory,
  utils,
} from "media-stream-track-controller";

import usePrevious from "@hooks/usePrevious";

// TODO: Document
/**
 * IMPORTANT: This hook should be treated as a singleton (provider based).
 */
export default function useInputMediaDevicesFactories({
  selectedInputMediaDevices,
  testingInputMediaDevices,

  removeSelectedInputMediaDevice,
  removeTestingInputMediaDevice,
}) {
  // These states are used in determination of whether to start / stop media devices
  const [_isAudioSelectorRendered, setIsAudioSelectorRendered] =
    useState(false);
  const [_isInCall, setIsInCall] = useState(false);

  const [inputMediaDevicesFactories, _setInputMediaDeviceFactories] = useState(
    []
  );

  const { getPreviousValue: getPreviousSelectedInputMediaDevices } =
    usePrevious(selectedInputMediaDevices);

  const { getPreviousValue: getPreviousTestingInputMediaDevices } = usePrevious(
    testingInputMediaDevices
  );

  // Dynamic capturing / uncapturing of media devices based on determined state
  useEffect(() => {
    (async () => {
      const { addedInputMediaDevices, removedInputMediaDevices } = (() => {
        const previousSelectedInputMediaDevices =
          getPreviousSelectedInputMediaDevices() || [];

        const previousTestingInputMediaDevices =
          getPreviousTestingInputMediaDevices() || [];

        const {
          added: _addedSelectedInputMediaDevices,
          removed: _removedSelectedInputMediaDevices,
        } = PhantomCollection.getChildrenDiff(
          previousSelectedInputMediaDevices,
          selectedInputMediaDevices
        );

        const {
          added: _addedTestingInputMediaDevices,
          removed: _removedTestingInputMediaDevices,
        } = PhantomCollection.getChildrenDiff(
          previousTestingInputMediaDevices,
          testingInputMediaDevices
        );

        const addedInputMediaDevices = [
          ...new Set([
            ..._addedSelectedInputMediaDevices,
            ..._addedTestingInputMediaDevices,
          ]),
        ];

        const removedInputMediaDevices = [
          ...new Set([
            ..._removedSelectedInputMediaDevices,
            ..._removedTestingInputMediaDevices,
          ]),
        ];

        return {
          addedInputMediaDevices,
          removedInputMediaDevices,
        };
      })();

      const removedFactories = await Promise.all(
        removedInputMediaDevices
          .map(removedMediaDevice => {
            const factories =
              MediaStreamTrackControllerFactory.getFactoriesWithMediaDevice(
                removedMediaDevice
              );

            if (factories) {
              return factories.map(factory => factory.destroy());
            } else {
              return [];
            }
          })
          .flat()
      );

      const addedFactories = await Promise.all(
        addedInputMediaDevices.map(async addedMediaDevice => {
          // TODO: Populate
          const constraints = {};
          const factoryOptions = {};

          try {
            const factory =
              await utils.captureMediaDevice.captureSpecificMediaDevice(
                addedMediaDevice,
                constraints,
                factoryOptions
              );

            return factory;
          } catch (err) {
            removeSelectedInputMediaDevice(addedMediaDevice);
            removeTestingInputMediaDevice(addedMediaDevice);

            logger.error(err);
          }
        })
      );

      // TODO: Capture added devices

      // TODO: For capture errors, remove device from selecting / testing

      // TODO: Remove
      console.log({
        // addedSelectedInputMediaDevices,
        // removedSelectedInputMediaDevices,

        // addedTestingInputMediaDevices,
        // removedTestingInputMediaDevices,

        addedFactories,
        removedFactories,

        addedInputMediaDevices,
        removedInputMediaDevices,

        _isAudioSelectorRendered,
        _isInCall,
      });
    })();

    // TODO: Implement

    // TODO: For uncapturing, look up existing factories with given device, and destruct them
    // MediaStreamTrackControllerFactory.getFactoriesWithMediaDevice(device);
  }, [
    selectedInputMediaDevices,
    getPreviousSelectedInputMediaDevices,

    testingInputMediaDevices,
    getPreviousTestingInputMediaDevices,

    _isAudioSelectorRendered,
    _isInCall,

    removeSelectedInputMediaDevice,
    removeTestingInputMediaDevice,
  ]);

  return {
    inputMediaDevicesFactories,

    setIsInCall,
    setIsAudioSelectorRendered,
  };
}
