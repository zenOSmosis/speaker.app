import React, { useCallback, useEffect, useState } from "react";
import Center from "@components/Center";
import Layout, { Content, Footer } from "@components/Layout";
import Section from "@components/Section";
import Full from "@components/Full";
import StaggeredWaveLoading from "@components/StaggeredWaveLoading/StaggeredWaveLoading";

import ReloadIcon from "@icons/ReloadIcon";

import AudioInputDevice from "./AudioInputDevice";

import useInputMediaDevicesContext from "@hooks/useInputMediaDevicesContext";
import useForceUpdate from "@hooks/useForceUpdate";

export default function AudioInputDeviceSelector() {
  const [isFetchingInputMediaDevices, setIsFetchingInputMediaDevices] =
    useState(false);
  const [audioInputDevicesError, setAudioInputMediaDevicesError] =
    useState(null);

  const {
    fetchMediaDevices: _fetchMediaDevices,
    audioInputDevices,

    // captureSpecificMediaDevice,
    // uncaptureSpecificMediaDevice,

    addSelectedInputMediaDevice,
    removeSelectedInputMediaDevice,

    addTestInputMediaDevice,
    removeTestInputMediaDevice,

    selectedAudioInputDevices,
    testAudioInputDevices,

    getInputMediaDeviceMediaStreamTrack,

    // TODO: Clean up unused props
    /*
    defaultAudioInputDevice,
    setDefaultAudioInputDevice,
    defaultAudioNoiseSuppression,
    setDefaultAudioNoiseSuppression,
    defaultAudioEchoCancellation,
    setDefaultAudioEchoCancellation,
    defaultAudioAutoGainControl,
    setDefaultAudioAutoGainControl,
    */
  } = useInputMediaDevicesContext();

  const handleFetchInputMediaDevices = useCallback(() => {
    setIsFetchingInputMediaDevices(true);
    setAudioInputMediaDevicesError(null);

    _fetchMediaDevices()
      .catch(err => {
        console.error(err);

        setAudioInputMediaDevicesError(err);
      })
      .finally(() => {
        setIsFetchingInputMediaDevices(false);
      });
  }, [_fetchMediaDevices]);

  // Automatically fetch input media devices upon first load
  useEffect(() => {
    handleFetchInputMediaDevices();
  }, [handleFetchInputMediaDevices]);

  // TODO: Reimplement
  // Automatically select default audio input device
  /*
  useEffect(() => {
    if (!defaultAudioInputDevice && audioInputDevices.length) {
      setDefaultAudioInputDevice(audioInputDevices[0]);
    }
  }, [audioInputDevices, defaultAudioInputDevice, setDefaultAudioInputDevice]);
  */

  // FIXME: This fixes issue where MediaStreamTrack might not be immediately
  // available after selecting a new device but might not be necessary if
  // forcing a new render after relevant track controllers have been changed
  const forceUpdate = useForceUpdate();
  useEffect(() => {
    if (
      audioInputDevices.length &&
      (selectedAudioInputDevices.length || testAudioInputDevices.length)
    ) {
      const to = setTimeout(forceUpdate, 100);

      return function unmount() {
        clearTimeout(to);
      };
    }
  }, [
    audioInputDevices,
    selectedAudioInputDevices,
    testAudioInputDevices,
    forceUpdate,
  ]);

  if (audioInputDevicesError) {
    return (
      <Center style={{ fontWeight: "bold" }}>
        Cannot obtain media devices. Do you have permissions blocked to access
        them?
      </Center>
    );
  }

  return (
    <Full>
      <Layout>
        <Content
          style={{
            // Don't show scrollbar when fetching
            overflow: !isFetchingInputMediaDevices ? "auto" : "inherit",
          }}
        >
          <Section>
            <div style={{ textAlign: "left" }}>
              <h1>Audio Input Devices</h1>
              <div className="note" style={{ marginBottom: 8 }}>
                Multiple devices can be streamed concurrently. If plugging in a
                new audio input device and it does not display in this list,
                press{" "}
                <button
                  onClick={handleFetchInputMediaDevices}
                  disabled={isFetchingInputMediaDevices}
                >
                  Refresh <ReloadIcon />
                </button>
                .
              </div>
            </div>

            {isFetchingInputMediaDevices && !audioInputDevices.length ? (
              <Center>
                <div>Fetching audio input devices</div>
                <div>
                  <StaggeredWaveLoading />
                </div>
              </Center>
            ) : (
              <div>
                {audioInputDevices.map((device, idx) => {
                  const isSelected = selectedAudioInputDevices.includes(device);
                  const isTesting = testAudioInputDevices.includes(device);

                  // TODO: Implement
                  const isAudioNoiseSuppression = true;
                  const setIsAudioNoiseSuppression = () =>
                    alert("TODO: Implement");
                  const isAudioEchoCancellation = true;
                  const setIsAudioEchoCancellation = () =>
                    alert("TODO: Implement");
                  const isAudioAutoGainControl = true;
                  const setIsAudioAutoGainControl = () =>
                    alert("TODO: Implement");

                  // TODO: Match from captureMediaDevice.getMediaDeviceTrackControllers
                  const mediaStreamTrack =
                    getInputMediaDeviceMediaStreamTrack(device);

                  return (
                    <AudioInputDevice
                      key={idx}
                      device={device}
                      isSelected={isSelected}
                      onToggleSelect={() =>
                        // TODO: Use callback function instead
                        !isSelected
                          ? addSelectedInputMediaDevice(device)
                          : removeSelectedInputMediaDevice(device)
                      }
                      isTesting={isTesting}
                      onToggleTest={() =>
                        // TODO: Use callback function instead
                        !isTesting
                          ? addTestInputMediaDevice(device)
                          : removeTestInputMediaDevice(device)
                      }
                      isAudioNoiseSuppression={isAudioNoiseSuppression}
                      setIsAudioNoiseSuppression={setIsAudioNoiseSuppression}
                      isAudioEchoCancellation={isAudioEchoCancellation}
                      setIsAudioEchoCancellation={setIsAudioEchoCancellation}
                      isAudioAutoGainControl={isAudioAutoGainControl}
                      setIsAudioAutoGainControl={setIsAudioAutoGainControl}
                      mediaStreamTrack={mediaStreamTrack}
                    />
                  );
                })}
              </div>
            )}
          </Section>
        </Content>
        <Footer style={{ backgroundColor: "rgba(0,0,0,.2)" }}>
          {!selectedAudioInputDevices.length && (
            <div>
              {
                // TODO: Change to "no input device available" if no audio devices are present
              }
              <div style={{ fontWeight: "bold", color: "yellow" }}>
                {
                  // TODO: Use caution sign as well
                }
                No audio input device selected for broadcasting.
              </div>
              <div>
                <span className="note">
                  Other participants will not be able to hear you.
                </span>
              </div>
            </div>
          )}
        </Footer>
      </Layout>
    </Full>
  );
}
