import React, { useCallback, useEffect } from "react";

import DrawCanvas from "@components/DrawCanvas";

import useAppLayoutContext from "@hooks/useAppLayoutContext";

// TODO: Show main app background as background to this view so the scaling matches
export default function DrawApplet() {
  const { setMainView, mainView } = useAppLayoutContext();

  // TODO: Handle syncing of draw coordinates / assets to remote peers

  const handleRenderDrawTool = useCallback(
    () => setMainView(() => <DrawCanvas />),
    [setMainView]
  );

  useEffect(handleRenderDrawTool, [handleRenderDrawTool]);

  return (
    <div>
      <button disabled={mainView} onClick={handleRenderDrawTool}>
        Render Draw Tool
      </button>
    </div>
  );
}
