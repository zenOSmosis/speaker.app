import React, { forwardRef, useImperativeHandle, useState } from "react";

export default forwardRef(function AudioLoopCreatorFooter(
  { pageMMSS, lenBeats, beatsPerSecond, isLooping },
  ref
) {
  const [percentage, setPercentage] = useState(null);
  const [beatIdx, setBeatIdx] = useState(null);

  useImperativeHandle(
    ref,
    () => ({
      onProgress: ({ percentage, beatIdx }) => {
        setPercentage(percentage);
        setBeatIdx(beatIdx);
      },
    }),
    []
  );

  return (
    <div
      style={{
        padding: "2px 0px",
        backgroundColor: "rgba(255,255,255,.1)",
        borderBottom: "1px rgba(255,255,255,.2) solid",
      }}
    >
      <div style={{ display: "inline-block", margin: "0px 4px" }}>
        <div>{pageMMSS}</div>
        <div>Page Duration</div>
      </div>

      <div style={{ display: "inline-block", margin: "0px 4px" }}>
        <div>{Math.ceil(percentage)}%</div>
        <div>Percent</div>
      </div>

      {
        // TODO: Show elapsed time (per page)
      }

      <div style={{ display: "inline-block", margin: "0px 4px" }}>
        <div>
          {beatIdx + 1} / {lenBeats}
        </div>
        <div>Beat Index</div>
      </div>

      <div style={{ display: "inline-block", margin: "0px 4px" }}>
        <div>~{Math.round(beatsPerSecond)}</div>
        <div>BPS</div>
      </div>

      <div style={{ display: "inline-block", margin: "0px 4px" }}>
        <div>{isLooping ? "Yes" : "No"}</div>
        <div>Looping</div>
      </div>
    </div>
  );
});
