import React, { Fragment, useCallback, useMemo, useState } from "react";
import Scene from "../Scene";

export default function SceneSequence({ children }) {
  // TODO: Iterate through each scene, determine it's a valid scene, and flow one scene to the next

  // Note: Scene sequence should be thought of as a scene in itself, with sub-scenes

  const [activeSceneIndexes, _setActiveSceneIndexes] = useState([0]);

  /*
  const handleTransitionOutBeforeCompleted = useCallback((idx) => {
    if (activeSceneIndexes.length === 1) {
      _setActiveSceneIndexes([idx + 1, idx])
    }
  }, [activeSceneIndexes])
  */

  const handleTransitionOutCompleted = useCallback((idx) => {
    _setActiveSceneIndexes([idx + 1]);
  }, []);

  const scenes = useMemo(
    () =>
      React.Children.toArray(children).map((scene, idx) => {
        return (
          <Scene
            key={idx}
            {...scene.props}
            // onTransitionOutBeforeCompleted={() => handleTransitionOutBeforeCompleted(idx)}
            // TODO: Determine if next scene should show after current scene completes, or should be mixed together for a brief interval
            onTransitionOutCompleted={() => handleTransitionOutCompleted(idx)}
          />
        );
      }),
    [children, handleTransitionOutCompleted]
  );

  const activeScenes = activeSceneIndexes.map((idx) => scenes[idx]);

  // TODO: Remove
  /*
  console.log({
    scenes,
    activeScenes,
  });
  */

  // TODO: Don't render next scene until already loaded

  if (activeScenes) {
    return (
      <Fragment>
        {activeScenes.map((scene, idx) => {
          return <Fragment key={idx}>{scene}</Fragment>;
        })}
      </Fragment>
    );
  } else {
    // TODO: Call onCompleteHandler (or equiv)

    return null;
  }
}
