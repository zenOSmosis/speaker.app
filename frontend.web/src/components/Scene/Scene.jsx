import React, { useEffect, useMemo, useRef } from "react";
import WebUIScene, {
  EVT_TRANSITION_IN_STARTED,
  EVT_TRANSITION_IN_COMPLETED,
  EVT_TRANSITION_OUT_STARTED,
  EVT_TRANSITION_OUT_BEFORE_COMPLETED,
  EVT_TRANSITION_OUT_COMPLETED,
  // EVT_CREATED,
  EVT_CANCELED,
} from "../../WebUIScene";
// import useAnimate from "../../hooks/useAnimate";
import classNames from "classnames";
import styles from "./Scene.module.css";

// TODO: Implement way of accessing uiScene from whatever implements this

export default function Scene({
  animationNames,
  children,
  className,
  style,
  title,
  onInvoke = async (uiScene) => null,
  onTransitionInStarted = async (uiScene) => null,
  onTransitionInCompleted = async (uiScene) => null,
  onTransitionOutStarted = async (uiScene) => null,
  onTransitionOutBeforeCompleted = async (uiScene) => null,
  onTransitionOutCompleted = async (uiScene) => null,
  onCanceled = async (uiScene) => null,
  onBeforeRender = async (uiScene) => null,
  ...lifecycleParams
}) {
  const refOpts = useRef({
    animationNames,
    lifecycleParams,
    title,
    onInvoke,
    onTransitionInStarted,
    onTransitionInCompleted,
    onTransitionOutStarted,
    onTransitionOutBeforeCompleted,
    onTransitionOutCompleted,
    onCanceled,
  });

  // TODO: Fix this so that if it re-renders it updates and doesn't create a new scene
  const uiScene = useRef(
    (() => {
      const {
        // animationNames,
        lifecycleParams,
        title,
        onInvoke,
        onTransitionInStarted,
        onTransitionInCompleted,
        onTransitionOutStarted,
        onTransitionOutBeforeCompleted,
        onTransitionOutCompleted,
      } = refOpts.current;

      /*
      if (typeof animationNames === "string") {
        // Coerce to array
        animationNames = [animationNames];
      }
      */

      const uiScene = new WebUIScene(lifecycleParams, title);

      onInvoke(uiScene);

      /*
      uiScene.once(EVT_CREATED, () => {
        console.debug(`${title ? `"${title}"` : `Untitled`} scene created`);
      });
      */

      // TODO: Log EVT_DESTROYED
      uiScene.once(EVT_TRANSITION_IN_STARTED, () =>
        onTransitionInStarted(uiScene)
      );
      uiScene.once(EVT_TRANSITION_IN_COMPLETED, () =>
        onTransitionInCompleted(uiScene)
      );
      uiScene.once(EVT_TRANSITION_OUT_STARTED, () =>
        onTransitionOutStarted(uiScene)
      );
      uiScene.once(EVT_TRANSITION_OUT_BEFORE_COMPLETED, () =>
        onTransitionOutBeforeCompleted(uiScene)
      );
      uiScene.once(EVT_TRANSITION_OUT_COMPLETED, () =>
        onTransitionOutCompleted(uiScene)
      );
      uiScene.once(EVT_CANCELED, () => {
        console.debug(`${title ? `"${title}"` : `Untitled`} scene cancelled`);

        onCanceled();
      });

      return uiScene;
    })()
  ).current;

  useEffect(() => {
    return function unmount() {
      uiScene.cancel();
    };
  }, [uiScene]);

  const View = useMemo(() => uiScene && uiScene.getView(), [uiScene]);

  if (!View) {
    return null;
  }

  onBeforeRender(uiScene);

  // TODO: Show clear pane over view, unless directly editable

  return (
    <View className={classNames(styles["Scene"], className)} style={style}>
      {
        // TODO: Implement cover view...?
      }
      {children}
    </View>
  );
}
