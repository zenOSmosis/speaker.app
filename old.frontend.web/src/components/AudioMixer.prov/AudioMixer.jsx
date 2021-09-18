import React from "react";
import styles from "./AudioMixer.module.css";
import classNames from "classnames";

/**
 * Borrowed from:
 * @see https://github.com/kevincennis/Mix.js
 */
// TODO: Maintain tab order
// TODO: Create Channel object
export default function AudioMixer({
  channels = [
    { channelName: "CH-1" },
    { channelName: "CH-2" },
    { channelName: "CH-3" },
    { channelName: "MASTER" },
  ],
  onChannelUpdated,
}) {
  return (
    <div className={styles["mixer"]}>
      {channels.map(({ channelName }, idx) => (
        <Channel
          key={idx}
          channelName={channelName}
          onActiveChange={(isActive) =>
            // TODO: Handle
            console.debug("on active changed", isActive)
          }
          onVolumeChange={(vol) => console.debug({ vol })}
          defaultLevel={30}
        />
      ))}
    </div>
  );
}

function Channel({
  channelName,
  isActive,
  onActiveChange,
  onVolumeChange,
  defaultLevel,
}) {
  return (
    <div className={styles["channel"]}>
      <button
        className={classNames(
          styles["btn"],
          styles["mute"]
        )} /* className="btn mute {{muted}}" */
      >
        M
      </button>
      <button
        className={classNames(
          styles["btn"],
          styles["solo"]
        )} /* className="btn mute {{muted}}" */ /* className="btn solo {{soloed}}" */
      >
        S
      </button>
      <button
        className={classNames(
          styles["btn"],
          styles["afl"]
        )} /* className="btn mute {{muted}}" */ /* className="btn afl {{afl}}" */
      >
        PFL
      </button>
      <div className={styles["pan"]}>
        <div
          className={styles["panner"]}
          // style="-webkit-transform: rotate({{pan}}deg); -moz-transform: rotate({{pan}}deg);"
        >
          <div className="pan-indicator"></div>
        </div>
      </div>
      <div className={styles["track"]}>
        {
          // <canvas className="meter" width="8" height="280"></canvas>
        }

        <input
          type="range"
          className={styles["fader"]} /* style="top: {{gain}}px;" */
        />
      </div>
      <p className={styles["label"]}>{channelName}</p>
    </div>
  );
}

/*
function MixerSlider({ defaultLevel, onVolumeChange }) {
  return <div>TODO: Make Slider</div>;
}
*/
