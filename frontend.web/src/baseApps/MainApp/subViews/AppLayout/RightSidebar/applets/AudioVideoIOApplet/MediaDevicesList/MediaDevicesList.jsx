import React, { useCallback, useEffect, useMemo, useState } from "react";
import List, { ListItem } from "@components/List";
import Section from "@components/Section";
import LED from "@components/LED";
import { AudioMediaStreamTrackLevelVUMeter } from "@components/VUMeter";
import ReloadIcon from "@icons/ReloadIcon";

import useInputMediaDevicesContext from "@hooks/useInputMediaDevicesContext";
import useWebPhantomSessionContext from "@hooks/useWebPhantomSessionContext";

export const DISPLAY_FILTER_TYPE_AUDIO = "audio";
export const DISPLAY_FILTER_TYPE_VIDEO = "video";
export const DISPLAY_FILTER_TYPE_BOTH = "both";

export const DISPLAY_FILTER_TYPES = [
  DISPLAY_FILTER_TYPE_AUDIO,
  DISPLAY_FILTER_TYPE_VIDEO,
  DISPLAY_FILTER_TYPE_BOTH,
];

export default function MediaDevicesList({ displayFilterType, prefixLabel }) {
  const [mediaDevices, setMediaDevices] = useState([]);
  const [isFetchingMediaDevices, setIsFetchingMediaDevices] = useState(false);

  const {
    isConnected,
    publishMediaStream,
    unpublishMediaStream,
    getIsMediaStreamPublished,
  } = useWebPhantomSessionContext();

  const {
    fetchMediaInputDevices,
    toggleCaptureAudioMedia,
    getAudioControllerWithDeviceId,
  } = useInputMediaDevicesContext();

  // TODO: Use io context here
  const fetchMediaDevices = useCallback(() => {
    setIsFetchingMediaDevices(true);
    fetchMediaInputDevices().then(mediaDevices => {
      // Filtered to displayFilterType
      const filteredMediaDevices = [];

      for (const mediaDevice of mediaDevices) {
        if (
          displayFilterType === DISPLAY_FILTER_TYPE_AUDIO &&
          mediaDevice.kind !== "audioinput" &&
          displayFilterType === DISPLAY_FILTER_TYPE_AUDIO &&
          mediaDevice.kind !== "audiooutput"
        ) {
          continue;
        }

        if (
          displayFilterType === DISPLAY_FILTER_TYPE_VIDEO &&
          mediaDevice.kind !== "videoinput" &&
          displayFilterType === DISPLAY_FILTER_TYPE_VIDEO &&
          mediaDevice.kind !== "videooutput"
        ) {
          continue;
        }

        filteredMediaDevices.push(mediaDevice);
      }

      setMediaDevices(filteredMediaDevices);
      setIsFetchingMediaDevices(false);
    });
  }, [fetchMediaInputDevices, displayFilterType]);

  // TODO: Refactor into WebZenRTCPeer, or similar
  const virtualMediaDevices = useMemo(() => {
    const virtualMediaDevices = [];

    const _addVirtualDevice = ({ kind, label }) => {
      virtualMediaDevices.push({ kind, label });
    };

    if (displayFilterType !== DISPLAY_FILTER_TYPE_AUDIO) {
      _addVirtualDevice({
        kind: "videoinput",
        label: "Screen Capture",
      });
    }

    if (displayFilterType !== DISPLAY_FILTER_TYPE_VIDEO) {
      _addVirtualDevice({
        kind: "audioinput",
        label: "Screen Capture (audio only)",
      });
    }

    return virtualMediaDevices;
  }, [displayFilterType]);

  useEffect(() => {
    fetchMediaDevices();
  }, [fetchMediaDevices]);

  return (
    <React.Fragment>
      <Section>
        <div
          style={{
            float: "right",
            marginTop: 8,
            whiteSpace: "nowrap",
          }}
        >
          <button onClick={fetchMediaDevices}>
            <span style={{ fontWeight: "bold" }}>Refresh</span>{" "}
            <ReloadIcon style={{ fontSize: "1.2em" }} />
          </button>
        </div>
        <h1>{prefixLabel} Devices</h1>

        <div style={{ position: "relative" }}>
          {isFetchingMediaDevices && (
            <div style={{ position: "absolute", color: "red", width: "100%" }}>
              Fetching {prefixLabel} Devices
            </div>
          )}

          <Section>
            <h2>{prefixLabel} Inputs</h2>
            <h3>Physical</h3>
            <List>
              {mediaDevices
                .filter(mediaDevice => mediaDevice.kind.includes("input"))
                .map((mediaDevice, idx) => {
                  const mediaController = getAudioControllerWithDeviceId(
                    mediaDevice.deviceId
                  );

                  const isAudio = mediaDevice.kind.includes("audio");
                  // const isVideo = mediaDevice.kind.includes("video");

                  const isCapturing = !!mediaController;

                  const isMonitoring =
                    mediaController && mediaController.getIsMonitoring();

                  const audioTracks = (mediaController &&
                    mediaController.getOutputMediaStreamAudioTracks()) || [
                    null,
                  ];

                  const mediaStream =
                    mediaController && mediaController.getOutputMediaStream();

                  const isPublished = getIsMediaStreamPublished(mediaStream);

                  // TODO: Remove
                  /*
                  console.debug({
                    mediaStream,
                    isPublished,
                    isCapturing,
                    isConnected,
                  });
                  */

                  return (
                    <ListItem key={idx}>
                      <div>
                        <div style={{ fontWeight: "bold" }}>
                          {mediaDevice.label || "Label N/A"}
                        </div>
                        <div className="note">
                          {!mediaDevice.label && (
                            <div
                              className="note"
                              style={{ marginBottom: "1em" }}
                            >
                              Label information may not be available until a
                              device is captured.
                            </div>
                          )}

                          <div>Kind: {mediaDevice.kind}</div>
                          <div>Device ID: {mediaDevice.deviceId}</div>
                          <div>Group ID: {mediaDevice.groupId}</div>
                        </div>
                      </div>
                      {isAudio && (
                        <div style={{ textAlign: "center", marginTop: 4 }}>
                          <button
                            onClick={() =>
                              toggleCaptureAudioMedia({
                                deviceId: { exact: mediaDevice.deviceId },
                              })
                            }
                          >
                            {
                              // TODO: Activate / deactivate LED according to track monitoring status
                            }
                            Capture <LED color={isCapturing ? "green" : null} />
                          </button>
                          <button
                            disabled={!isCapturing}
                            onClick={() =>
                              mediaController &&
                              mediaController.toggleMonitoring()
                            }
                          >
                            {
                              // TODO: Activate / deactivate LED according to track monitoring status
                            }
                            Monitor{" "}
                            <LED color={isMonitoring ? "green" : null} />
                          </button>
                          <button
                            disabled={!isConnected || !isCapturing}
                            onClick={() =>
                              !isPublished
                                ? publishMediaStream(mediaStream)
                                : unpublishMediaStream(mediaStream)
                            }
                          >
                            {
                              // TODO: Activate / deactivate LED according to track published status
                              // TODO: Enable if connected
                            }
                            Publish <LED color={isPublished ? "green" : null} />
                          </button>
                        </div>
                      )}

                      {isAudio && (
                        <div style={{ textAlign: "center" }}>
                          {audioTracks.map((audioTrack, idx) => (
                            <AudioMediaStreamTrackLevelVUMeter
                              key={idx}
                              mediaStreamTrack={audioTrack}
                              style={{ marginTop: 22 }}
                            />
                          ))}
                        </div>
                      )}

                      <div>
                        TODO: Include latency / other readings (track volume
                        setting, etc. )
                      </div>
                    </ListItem>
                  );
                })}
            </List>

            {virtualMediaDevices.length > 0 && (
              <React.Fragment>
                <h3>Virtual</h3>
                <List>
                  {virtualMediaDevices.map(({ kind, label }, idx) => (
                    <ListItem key={idx}>
                      <div style={{ fontWeight: "bold" }}>{label}</div>

                      <div className="note">
                        {!label && (
                          <div className="note" style={{ marginBottom: "1em" }}>
                            Label cannot be obtained in this browser. Try
                            switching browsers if label is needed.
                          </div>
                        )}

                        <div>Kind: {kind}</div>
                      </div>
                    </ListItem>
                  ))}
                </List>
              </React.Fragment>
            )}
          </Section>

          <Section>
            <h2>{prefixLabel} Outputs</h2>
            <List>
              {mediaDevices
                .filter(device => device.kind.includes("output"))
                .map((mediaDevice, idx) => {
                  return (
                    <ListItem key={idx}>
                      <div>
                        <div style={{ fontWeight: "bold" }}>
                          {mediaDevice.label || "Label N/A"}
                        </div>
                        <div className="note">
                          {!mediaDevice.label && (
                            <div
                              className="note"
                              style={{ marginBottom: "1em" }}
                            >
                              Label cannot be obtained in this browser. Try
                              switching browsers if label is needed.
                            </div>
                          )}

                          <div>Kind: {mediaDevice.kind}</div>
                          <div>Device ID: {mediaDevice.deviceId}</div>
                          <div>Group ID: {mediaDevice.groupId}</div>
                        </div>
                      </div>
                    </ListItem>
                  );
                })}
            </List>
          </Section>
        </div>
      </Section>
    </React.Fragment>
  );
}
