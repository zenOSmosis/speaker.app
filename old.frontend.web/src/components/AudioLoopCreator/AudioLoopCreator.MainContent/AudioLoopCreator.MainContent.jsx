import React, { useRef, forwardRef, useImperativeHandle } from "react";
import { Row, Column } from "@components/Layout";
import TimeScroller from "./TimeScroller";
import TrackRow, { TrackAdjuster } from "./TrackRow";

export default forwardRef(function AudioLoopCreatorMainContent(
  { tracks, lenBeats, beatsPerBar, styles },
  ref
) {
  const refButtonTableContainer = useRef(null);
  const refTimeScroller = useRef(null);

  useImperativeHandle(
    ref,
    () => ({
      onProgress: ({ percentage }) => {
        refTimeScroller.current.setPercentage(percentage);
      },
    }),
    []
  );

  return (
    <Row className={styles["content-row"]}>
      <Column className={styles["left-column"]}>
        {
          // TODO: Mirror button table vertical scroll w/ relevant multi-button
          // table (but don't show scrollbars here)
        }
        <div>
          {tracks.map((track, idx) => (
            <TrackAdjuster key={idx} track={track} />
          ))}
        </div>
      </Column>
      <Column className={styles["main-column"]}>
        <div
          ref={refButtonTableContainer}
          className={styles["button-table-container"]}
        >
          <table className={styles["button-table"]}>
            <tbody>
              {tracks.map((track, idx) => {
                return (
                  <TrackRow
                    key={idx}
                    styles={styles}
                    track={track}
                    lenBeats={lenBeats}
                    beatsPerBar={beatsPerBar}
                  />
                );
              })}
            </tbody>
          </table>

          <TimeScroller
            ref={refTimeScroller}
            refButtonTableContainer={refButtonTableContainer}
          />
        </div>
      </Column>
    </Row>
  );
});
