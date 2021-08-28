import { PhantomCollection, logger, EVT_DESTROYED } from "phantom-core";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MediaStreamTrackControllerFactory,
  utils,
} from "media-stream-track-controller";

import useArrayDiff from "@hooks/useArrayDiff";

// TODO: Document
/**
 * IMPORTANT: This hook should be treated as a singleton (provider based).
 */
export default function useInputMediaDevicesFactories({
  isInCall,
  isAudioSelectorRendered,

  selectedInputMediaDevices,
  testingInputMediaDevices,

  removeSelectedInputMediaDevice,
  removeTestingInputMediaDevice,
}) {
  const [inputMediaDevicesFactories, _setInputMediaDeviceFactories] = useState(
    []
  );

  // TODO: Rename
  // TODO: Reset on call / rendered state (not accurate if testing, leaving screen, then returning)
  const comparisonDiff = useMemo(() => {
    if (!isInCall && !isAudioSelectorRendered) {
      return [];
    }

    return [
      ...new Set([...selectedInputMediaDevices, ...testingInputMediaDevices]),
    ];
  }, [
    isInCall,
    isAudioSelectorRendered,
    selectedInputMediaDevices,
    testingInputMediaDevices,
  ]);

  // TODO: Rename
  const { added: addedInputMediaDevices, removed: removedInputMediaDevices } =
    useArrayDiff(comparisonDiff);

  /**
   * @return {Promise<void>}
   */
  const destroyAllInputMediaDeviceFactories = useCallback(async () => {
    // IMPORTANT: Factories aren't looked up from the state here due to the
    // fact the state might not currently be written w/ this info depending on
    // where we are in the event loop
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

    if (factories.length) {
      await Promise.all(factories.map(factory => factory.destroy()));

      _setInputMediaDeviceFactories([]);
    }
  }, [selectedInputMediaDevices, testingInputMediaDevices]);

  // Dynamic capturing / uncapturing of media devices based on determined state
  useEffect(() => {
    const areSelectedDevicesEnabled = isInCall || isAudioSelectorRendered;
    const areTestingDevicesEnabled = isAudioSelectorRendered;

    if (!areSelectedDevicesEnabled && !areTestingDevicesEnabled) {
      destroyAllInputMediaDeviceFactories();
    } else {
      (async () => {
        const removeFactoryPromises = removedInputMediaDevices
          .map(async removedMediaDevice => {
            const factories =
              MediaStreamTrackControllerFactory.getFactoriesWithInputMediaDevice(
                removedMediaDevice
              );

            if (factories) {
              await factories.forEach(factory => factory.destroy());

              return factories;
            } else {
              return [];
            }
          })
          .flat();

        const removedFactories = await Promise.all(removeFactoryPromises);

        const addedFactories = [];
        for (const addedMediaDevice of addedInputMediaDevices) {
          // TODO: Populate
          const constraints = {};
          const factoryOptions = {};

          // Ignore duplicate factory creation w/ same device
          if (
            MediaStreamTrackControllerFactory.getFactoriesWithInputMediaDevice(
              addedMediaDevice
            ).length
          ) {
            continue;
          }

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

            addedFactories.push(factory);
          } catch (err) {
            // Remove device from selecting / testing states (so UI will update)
            removeSelectedInputMediaDevice(addedMediaDevice);
            removeTestingInputMediaDevice(addedMediaDevice);

            logger.error(err);
          }
        }

        // TODO: Remove
        console.log({
          addedInputMediaDevices,
          removedInputMediaDevices,

          addedFactories,
          removedFactories,
        });

        if (removedFactories.length || addedFactories.length) {
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
        }
      })();
    }
  }, [
    isAudioSelectorRendered,
    isInCall,

    addedInputMediaDevices,
    removedInputMediaDevices,

    selectedInputMediaDevices,
    // getPreviousSelectedInputMediaDevices,

    testingInputMediaDevices,
    // getPreviousTestingInputMediaDevices,

    removeSelectedInputMediaDevice,
    removeTestingInputMediaDevice,

    destroyAllInputMediaDeviceFactories,
  ]);

  return {
    inputMediaDevicesFactories,
  };
}
