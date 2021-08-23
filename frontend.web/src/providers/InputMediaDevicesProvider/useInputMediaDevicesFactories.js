import { PhantomCollection, logger, EVT_DESTROYED } from "phantom-core";
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

  const destroyAllInputMediaDeviceFactories = useCallback(async () => {
    const factories = [
      ...new Set([...selectedInputMediaDevices, ...testingInputMediaDevices]),
    ]
      .map(device =>
        MediaStreamTrackControllerFactory.getFactoriesWithInputMediaDevice(
          device,
          "audio"
        )
      )
      .flat();

    await Promise.all(factories.map(factory => factory.destroy()));

    _setInputMediaDeviceFactories([]);
  }, [selectedInputMediaDevices, testingInputMediaDevices]);

  // Dynamic capturing / uncapturing of media devices based on determined state
  useEffect(() => {
    const areSelectedDevicesEnabled = _isInCall || _isAudioSelectorRendered;
    const areTestingDevicesEnabled = _isAudioSelectorRendered;

    // TODO: Remove
    console.log({ areSelectedDevicesEnabled, areTestingDevicesEnabled });

    if (!areSelectedDevicesEnabled && !areTestingDevicesEnabled) {
      destroyAllInputMediaDeviceFactories();
    } else {
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
            // Don't add any new selected devices if audio selector is not rendered
            areSelectedDevicesEnabled ? selectedInputMediaDevices : []
          );

          const {
            added: _addedTestingInputMediaDevices,
            removed: _removedTestingInputMediaDevices,
          } = PhantomCollection.getChildrenDiff(
            previousTestingInputMediaDevices,
            // Don't add any new testing devices if audio selector is not rendered
            areTestingDevicesEnabled ? testingInputMediaDevices : []
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
                MediaStreamTrackControllerFactory.getFactoriesWithInputMediaDevice(
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
          addedInputMediaDevices
            .map(async addedMediaDevice => {
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

                factory.once(EVT_DESTROYED, () => {
                  _setInputMediaDeviceFactories(prev =>
                    [...prev].filter(predicate => predicate !== factory)
                  );
                });

                return factory;
              } catch (err) {
                // Remove device from selecting / testing states (so UI will update)
                removeSelectedInputMediaDevice(addedMediaDevice);
                removeTestingInputMediaDevice(addedMediaDevice);

                logger.error(err);
              }
            })
            // Remove entries which have no factory instance
            .filter(factory => Boolean(factory))
        );

        // Set next factories state
        _setInputMediaDeviceFactories(prevFactories => {
          const nextFactories = [
            ...prevFactories.filter(factory =>
              removedFactories.includes(factory)
            ),
            ...addedFactories,
          ];

          return nextFactories;
        });
      })();
    }
  }, [
    selectedInputMediaDevices,
    getPreviousSelectedInputMediaDevices,

    testingInputMediaDevices,
    getPreviousTestingInputMediaDevices,

    _isAudioSelectorRendered,
    _isInCall,

    removeSelectedInputMediaDevice,
    removeTestingInputMediaDevice,

    destroyAllInputMediaDeviceFactories,
  ]);

  return {
    inputMediaDevicesFactories,

    setIsInCall,
    setIsAudioSelectorRendered,
  };
}
