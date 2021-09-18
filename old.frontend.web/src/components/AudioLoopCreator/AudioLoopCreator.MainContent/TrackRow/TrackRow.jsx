import React, { Fragment } from "react";
import classNames from "classnames";

export default function TrackRow({ styles, track, lenBeats, beatsPerBar }) {
  // const trackId = useMemo(() => track.getId(), []);

  return (
    <Fragment>
      <tr className={styles["track-row"]}>
        {[...new Array(lenBeats)].map((_x, timeIdx) => {
          const hasBeatTimeIdx = track.getHasBeatTimeIdx(timeIdx);

          return (
            <Fragment key={timeIdx}>
              <td
                className={classNames(
                  styles["track-bar-spacer"],
                  styles[timeIdx % beatsPerBar ? "bar-start" : "bar-inner"]
                )}
              ></td>
              <td className={styles["button-container-cell"]}>
                <button
                  onClick={() => track.toggleRegisterBeatTimeIdx(timeIdx)} // TODO: Remove
                  className={hasBeatTimeIdx ? styles["active"] : null}
                >
                  {timeIdx + 1}
                </button>
              </td>
            </Fragment>
          );
        })}
      </tr>
    </Fragment>
  );
}
