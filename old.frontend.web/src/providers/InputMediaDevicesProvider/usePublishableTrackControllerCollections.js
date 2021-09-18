import { useEffect } from "react";
import { MediaStreamTrackControllerCollection } from "media-stream-track-controller";
import usePhantomCollection from "@hooks/usePhantomCollection";

// TODO: Document
/**
 * IMPORTANT: This hook should be treated as a singleton (provider based).
 *
 * @param {Object}
 * @return {Object}
 */
export default function usePublishableTrackControllerCollections({
  isInCall,
  // isAudioSelectorRendered,

  selectedInputMediaDevices,
  inputMediaDevicesFactories,
}) {
  const {
    collection: publishableAudioInputControllerCollection,
    children: publishableAudioInputTrackControllers,
  } = usePhantomCollection(MediaStreamTrackControllerCollection);

  const {
    collection: publishableVideoInputControllerCollection,
    children: publishableVideoInputTrackControllers,
  } = usePhantomCollection(MediaStreamTrackControllerCollection);

  // TODO: Diff out track controllers and add / remove them from their relevant collections
  useEffect(() => {
    if (isInCall) {
      const trackControllers = inputMediaDevicesFactories
        .map(factory => factory.getTrackControllers())
        .flat();

      for (const controller of trackControllers) {
        const kind = controller.getKind();

        switch (kind) {
          case "audio":
            publishableAudioInputControllerCollection.addTrackController(
              controller
            );
            break;

          case "video":
            publishableVideoInputControllerCollection.addTrackController(
              controller
            );
            break;

          default:
            throw new ReferenceError(`Unknown controller kind: ${kind}`);
        }
      }
    } else {
      // Empty out existing children
      publishableAudioInputControllerCollection.removeAllChildren();
      publishableVideoInputControllerCollection.removeAllChildren();
    }

    // TODO: Use PhantomCollection removeAllChildren if not in a call,
  }, [
    isInCall,
    // isAudioSelectorRendered,
    publishableAudioInputControllerCollection,
    publishableVideoInputControllerCollection,

    selectedInputMediaDevices,
    inputMediaDevicesFactories,
  ]);

  return {
    publishableAudioInputControllerCollection,
    publishableVideoInputControllerCollection,

    publishableAudioInputTrackControllers,
    publishableVideoInputTrackControllers,
  };
}
