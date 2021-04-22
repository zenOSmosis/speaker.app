import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { MediaStreamTrackAudioLevelMeter } from "../AudioLevelMeter";
import styles from "./AudioMixer.module.css";
import classNames from "classnames";

/**
 * Borrowed from:
 * @see https://codepen.io/glitchtank/pen/HluCj
 */
// TODO: Maintain tab order

AudioMixer.propTypes = {
  channels: PropTypes.arrayOf(
    PropTypes.shape({
      channelName: PropTypes.string.isRequired,
      isActive: PropTypes.bool.isRequired,
      onChange: PropTypes.func.isRequired,
      volumeLevel: PropTypes.number.isRequired,
      mediaStream: PropTypes.instanceOf(MediaStream),
    })
  ).isRequired,
};

export default function AudioMixer({ channels }) {
  return (
    <div className={styles["mixer"]}>
      {channels.map(
        (
          {
            channelName,
            isActive = true,
            onChange = (data) => console.debug(data),
            volumeLevel,
            mediaStream,
            ...rest
          },
          idx
        ) => (
          <ChannelView
            key={idx}
            channelName={channelName}
            onChange={onChange}
            isActive={isActive}
            volumeLevel={volumeLevel}
            mediaStream={mediaStream}
            {...rest}
          />
        )
      )}
    </div>
  );
}

function ChannelView({
  channelName,
  isActive,
  onChange,
  volumeLevel,
  mediaStream,
  ...rest
}) {
  const [channelData, _setChannelData] = useState({
    channelName,
    isActive,
    volumeLevel,
    ...rest,
  });

  const updateChannelData = useCallback(
    ({ ...next }) => {
      const updatedChannelData = { ...channelData, ...next };

      _setChannelData(updatedChannelData);

      onChange(updatedChannelData);
    },
    [channelData, onChange]
  );

  return (
    <section className={styles["channel"]}>
      {
        // TODO: Replace these fake rotary dials
      }
      <div style={{ marginTop: 10 }}>
        {mediaStream && (
          <React.Fragment>
            {mediaStream.getAudioTracks().map((audioTrack, idx) => (
              <MediaStreamTrackAudioLevelMeter
                key={idx}
                mediaStreamTrack={audioTrack}
                style={{ height: 60, width: 20 }}
              />
            ))}
          </React.Fragment>
        )}
      </div>
      <div className={styles["label"]}>{channelName}</div>
      <button
        onClick={() =>
          updateChannelData({
            isActive: !channelData.isActive,
          })
        }
        className={isActive ? styles["active"] : null}
      ></button>
      <Fader
        defaultLevel={volumeLevel}
        onVolumeChange={(volumeLevel) => updateChannelData({ volumeLevel })}
      />
    </section>
  );
}

function Fader({ defaultLevel, onVolumeChange }) {
  return (
    <React.Fragment>
      <ul>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
      </ul>
      <input
        className={classNames(styles["slider"], styles["master"])}
        defaultValue={defaultLevel}
        type="range"
        min="0"
        max="100"
        onChange={(evt) => onVolumeChange(parseInt(evt.target.value, 10))}
      />
    </React.Fragment>
  );
}
