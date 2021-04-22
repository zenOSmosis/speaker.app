import React from "react";

import PanelParticipantsScroller, {
  VERTICAL_ORIENTATION,
} from "../../PanelParticipantsScroller";

export default function LeftSidebar() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <PanelParticipantsScroller orientation={VERTICAL_ORIENTATION} />
    </div>
  );
}
