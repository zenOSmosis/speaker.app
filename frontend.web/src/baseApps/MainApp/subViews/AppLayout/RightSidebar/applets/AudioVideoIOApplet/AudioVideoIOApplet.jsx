import React, { useCallback, useEffect, useMemo, useState } from "react";
import Layout, { Content, Footer } from "@components/Layout";
import Section from "@components/Section";
import { AudioMediaStreamTrackLevelMeter } from "@components/AudioLevelMeter";
import { Video } from "@components/AV";
import ButtonPanel from "@components/ButtonPanel";
import AutoScaler from "@components/AutoScaler";
import { ControlledAudioMixer } from "@components/AudioMixer";
import MediaDevicesList, {
  DISPLAY_FILTER_TYPES,
  DISPLAY_FILTER_TYPE_AUDIO,
  DISPLAY_FILTER_TYPE_VIDEO,
  DISPLAY_FILTER_TYPE_BOTH,
} from "./MediaDevicesList";

import AudioMixerIcon from "@icons/AudioMixerIcon";

import SpeakerIcon from "@icons/SpeakerIcon";
import TelevisionIcon from "@icons/TelevisionIcon";
import capitalize from "@shared/string/capitalize";

import useAppLayoutContext from "@hooks/useAppLayoutContext";
import useZenRTCContext from "@hooks/useZenRTCContext";

export default function AudioVideoIOApplet({
  defaultDisplayFilterType,

  // TODO: Use context for this, instead
  outgoingMediaStreamTracks = [],
  incomingMediaStreamTracks = [],
}) {
  const { zenRTCPeer } = useZenRTCContext();

  const { setMainView } = useAppLayoutContext();

  const [displayFilterType, setDisplayFilterType] = useState(
    !defaultDisplayFilterType
      ? DISPLAY_FILTER_TYPE_BOTH
      : DISPLAY_FILTER_TYPES[
          DISPLAY_FILTER_TYPES.indexOf(defaultDisplayFilterType)
        ]
  );

  /**
   * Applies audio / video / "both" filtering to the given list of MediaStreamTracks.
   */
  const filterTracks = useCallback(
    mediaStreamTracks => {
      switch (displayFilterType) {
        case DISPLAY_FILTER_TYPE_AUDIO:
          return mediaStreamTracks.filter(({ kind }) => kind === "audio");

        case DISPLAY_FILTER_TYPE_VIDEO:
          return mediaStreamTracks.filter(({ kind }) => kind === "video");

        default:
          return mediaStreamTracks;
      }
    },
    [displayFilterType]
  );

  // Filtered to current display type
  const filteredOutgoingMediaStreamTracks = useMemo(
    () => filterTracks(outgoingMediaStreamTracks),
    [outgoingMediaStreamTracks, filterTracks]
  );

  // Filtered to current display type
  const filteredIncomingMediaStreamTracks = useMemo(
    () => filterTracks(incomingMediaStreamTracks),
    [incomingMediaStreamTracks, filterTracks]
  );

  // "Audio" / "Video" / "Media"
  const prefixLabel = useMemo(
    () =>
      displayFilterType !== DISPLAY_FILTER_TYPE_BOTH
        ? capitalize(displayFilterType)
        : "Media",
    [displayFilterType]
  );

  // Reset main view once component unmounts
  useEffect(() => {
    return function unmount() {
      setMainView(null);
    };
  }, [setMainView]);

  return (
    <Layout>
      <Content>
        <div style={{ width: "100%", height: "100%", overflowY: "auto" }}>
          <MediaDevicesList
            displayFilterType={displayFilterType}
            prefixLabel={prefixLabel}
          />

          <Section>
            <h1>{prefixLabel} Stream Monitor</h1>

            {
              // TODO: Provide labeling for each participant
              // TODO: Utilize zenRTCPeer.getTrackMediaStream() in order to obtain media streams for these tracks
            }
            {[
              ...filteredOutgoingMediaStreamTracks,
              ...filteredIncomingMediaStreamTracks,
            ].map((mediaStreamTrack, idx) => {
              // TODO: Memoize this
              const mediaStream =
                zenRTCPeer.getTrackMediaStream(mediaStreamTrack);

              // TODO: Refactor
              if (mediaStreamTrack.kind === "audio") {
                const { channelCount, deviceId, latency, sampleRate } =
                  mediaStreamTrack.getSettings();

                return (
                  <Section key={idx} style={{ overflow: "auto" }}>
                    <AudioMediaStreamTrackLevelMeter
                      mediaStreamTrack={mediaStreamTrack}
                      style={{
                        height: 150,
                        width: 30,
                      }}
                    />

                    <h2>
                      {capitalize(mediaStreamTrack.kind)} Track{" "}
                      {mediaStreamTrack.label}
                    </h2>

                    <div
                      style={{
                        textAlign: "left",
                        float: "left",
                        maxWidth: "60%",
                      }}
                    >
                      <div>Kind: {mediaStreamTrack.kind}</div>
                      <div>Channel Count: {channelCount}</div>
                      <div>Latency: {latency}</div>
                      <div>Sample Rate: {sampleRate}</div>
                      <div>Device Id: {deviceId}</div>
                      <div>
                        Media Stream Id: {mediaStream && mediaStream.id}
                      </div>

                      <div>[TODO: Include read receipts]</div>
                      <div>[TODO: Include relevant participant]</div>
                      <div>
                        [TODO: Include volume changing (audio):
                        (applyConstraints( --curly--volume: 0.5--curly-- ))]
                      </div>
                    </div>
                  </Section>
                );
              } else if (mediaStreamTrack.kind === "video") {
                return (
                  <Section key={idx} style={{ overflow: "auto" }}>
                    <Video
                      mediaStreamTrack={mediaStreamTrack}
                      style={{ width: "100%" }}
                    />
                  </Section>
                );
              } else {
                return null;
              }
            })}
          </Section>

          {displayFilterType !== DISPLAY_FILTER_TYPE_VIDEO && (
            <Section>
              <button
                onClick={() =>
                  setMainView(() => (
                    <AutoScaler>
                      <ControlledAudioMixer />
                    </AutoScaler>
                  ))
                }
              >
                Audio Mixer <AudioMixerIcon style={{ fontSize: "1.2rem" }} />
              </button>
            </Section>
          )}

          <div>
            <div>[TODO: Audio [only] from screencapture API]</div>
            <div>[TODO: Direct audio passthrough]</div>
          </div>
        </div>
      </Content>
      <Footer>
        <ButtonPanel
          // TODO: Rework defaultSelectedIdx property
          // defaultSelectedIdx={DISPLAY_FILTER_TYPES.indexOf(displayFilterType)}
          buttons={[
            {
              content: () => (
                <React.Fragment>
                  Audio{" "}
                  <SpeakerIcon style={{ marginLeft: 4, fontSize: "1.2em" }} />
                </React.Fragment>
              ),
              onClick: () => setDisplayFilterType(DISPLAY_FILTER_TYPE_AUDIO),
            },
            {
              content: () => (
                <React.Fragment>
                  Video{" "}
                  <TelevisionIcon
                    style={{ marginLeft: 4, fontSize: "1.2em" }}
                  />
                </React.Fragment>
              ),
              onClick: () => setDisplayFilterType(DISPLAY_FILTER_TYPE_VIDEO),
            },
            {
              content: () => (
                <React.Fragment>
                  Both{" "}
                  <SpeakerIcon style={{ marginLeft: 4, fontSize: "1.2em" }} />
                  <TelevisionIcon
                    style={{ marginLeft: 4, fontSize: "1.2em" }}
                  />
                </React.Fragment>
              ),
              onClick: () => setDisplayFilterType(DISPLAY_FILTER_TYPE_BOTH),
            },
          ]}
        />
      </Footer>
    </Layout>
  );
}
