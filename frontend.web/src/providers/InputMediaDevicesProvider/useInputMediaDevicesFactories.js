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

  // TODO: Remove
  /*
  console.log({
    inputMediaDevicesFactories,
  });
  */

  const { getPreviousValue: getPreviousSelectedInputMediaDevices } =
    usePrevious(selectedInputMediaDevices);

  const { getPreviousValue: getPreviousTestingInputMediaDevices } = usePrevious(
    testingInputMediaDevices
  );

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

    await Promise.all(factories.map(factory => factory.destroy()));

    _setInputMediaDeviceFactories([]);
  }, [selectedInputMediaDevices, testingInputMediaDevices]);

  // Dynamic capturing / uncapturing of media devices based on determined state
  useEffect(() => {
    const areSelectedDevicesEnabled = isInCall || isAudioSelectorRendered;
    const areTestingDevicesEnabled = isAudioSelectorRendered;

    if (!areSelectedDevicesEnabled && !areTestingDevicesEnabled) {
      destroyAllInputMediaDeviceFactories();
    } else {
      (async () => {
        const { addedInputMediaDevices, removedInputMediaDevices } = (() => {
          // IMPORTANT: The use of "true" for argument in getPrevious... calls
          // below.  The previous issue was that if using "select" and "test"
          // for the same device, then deactivating them, the device could not
          // be activated again until both were enabled.  If using just an
          // empty array, it's not possible to deactivate the device ever.  So
          // the logic is, after obtaining the previous value one time, reset
          // it back to the initial without changing the state, so that
          // subsequent runs will have a fresh slate to work from.

          const previousSelectedInputMediaDevices =
            getPreviousSelectedInputMediaDevices(true) || [];

          const previousTestingInputMediaDevices =
            getPreviousTestingInputMediaDevices(true) || [];

          const {
            added: addedInputMediaDevices,
            removed: removedInputMediaDevices,
          } = PhantomCollection.getChildrenDiff(
            [
              ...new Set([
                ...previousSelectedInputMediaDevices,
                ...previousTestingInputMediaDevices,
              ]),
            ],
            [
              ...new Set([
                ...(areSelectedDevicesEnabled ? selectedInputMediaDevices : []),
                ...(areTestingDevicesEnabled ? testingInputMediaDevices : []),
              ]),
            ]
          );

          return {
            addedInputMediaDevices,
            removedInputMediaDevices,
          };
        })();

        const removedFactories = removedInputMediaDevices
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

        // Set next factories state
        _setInputMediaDeviceFactories(prevFactories => {
          const nextFactories = [
            ...prevFactories.filter(factory =>
              removedFactories.includes(factory)
            ),
            ...addedFactories,
          ];

          // TODO: Remove
          /*
          console.log({
            addedFactories,
            removedFactories,
            nextFactories,
            selectedInputMediaDevices,
            testingInputMediaDevices,
          });
          */

          return nextFactories;
        });
      })();
    }
  }, [
    isAudioSelectorRendered,
    isInCall,

    selectedInputMediaDevices,
    getPreviousSelectedInputMediaDevices,

    testingInputMediaDevices,
    getPreviousTestingInputMediaDevices,

    removeSelectedInputMediaDevice,
    removeTestingInputMediaDevice,

    destroyAllInputMediaDeviceFactories,
  ]);

  return {
    inputMediaDevicesFactories,
  };
}
