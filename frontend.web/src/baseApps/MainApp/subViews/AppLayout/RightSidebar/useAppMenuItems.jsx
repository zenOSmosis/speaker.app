import React, { useCallback, useMemo } from "react";
// import Center from "@components/Center";
import LED from "@components/LED";
import SignalStrengthIndicator from "@components/SignalStrengthIndicator";
import LatencyIcon from "@icons/LatencyIcon";
// import AntennaIcon from "@icons/AntennaIcon";
import ChangeIcon from "@icons/ChangeIcon";
import getWebRTCSignalStrength from "@shared/webRTC/getWebRTCSignalStrength";
import getPercentColor from "@shared/string/getPercentColor";
// import ParticipantsApplet from "./applets/ParticipantsApplet";
// import MediaStreamerApplet from "./applets/MediaStreamerApplet";
// import DynamicControllersContainerApplet from "./applets/DynamicControllersContainerApplet";
// import MusicCreatorApplet from "./applets/MusicCreatorApplet";
// import TTSApplet from "./applets/TTSApplet";
// import TextIcon from "@icons/TextIcon";
// import AudioVideoIOApplet from "./applets/AudioVideoIOApplet";
// import VideoCameraIcon from "@icons/VideoCameraIcon";
import ChatIcon from "@icons/ChatIcon";
import ChatApplet from "./applets/ChatApplet";
import PowerIcon from "@icons/PowerIcon";
import MicrophoneIcon from "@icons/MicrophoneIcon";
// import MusicIcon from "@icons/MusicIcon";
// import PeopleIcon from "@icons/PeopleIcon";
// import TensorFlowIcon from "@icons/TensorFlowIcon";
// import HardDriveIcon from "@icons/HardDriveIcon";
import ScreenShareIcon from "@icons/ScreenShareIcon";
// import FullScreenIcon from "@icons/FullScreenIcon";
// import TensorFlowApplet from "./applets/TensorFlowApplet";
// import MediaSharingApplet from "./applets/MediaSharingApplet";
import InfoIcon from "@icons/InfoIcon";
import InfoApplet from "./applets/InfoApplet";
// import DrawIcon from "@icons/DrawIcon";
// import DrawApplet from "./applets/DrawApplet";
// import PairingIcon from "@icons/PairingIcon";
import ShareIcon from "@icons/ShareIcon";
import ShareApplet from "./applets/ShareApplet";
import Avatar from "@components/Avatar";
// import CustomizationApplet from "./applets/CustomizationApplet";
// import CustomizeIcon from "@icons/CustomizeIcon";
// import SearchApplet from "./applets/SearchApplet";
// import SearchIcon from "@icons/SearchIcon";
import SettingsIcon from "@icons/SettingsIcon";

import useAppRoutesContext from "@hooks/useAppRoutesContext";
import {
  ROUTE_SETUP_CONFIGURE,
  ROUTE_SETUP_PROFILE,
  ROUTE_SETUP_NETWORKS,
  ROUTE_CALL_URL,
  ROUTE_CALL_DISCONNECT,
} from "@baseApps/MainApp/routes";

// import useZenRTCContext from "@hooks/useZenRTCContext";
import useWebPhantomSessionContext from "@hooks/useWebPhantomSessionContext";
import useInputMediaDevicesContext from "@hooks/useInputMediaDevicesContext";
import useScreenCaptureContext from "@hooks/useScreenCaptureContext";

import { AudioMediaStreamTrackLevelMeter } from "@components/AudioLevelMeter";

// import Center from "@components/Center";
import useLocalProfileContext from "@hooks/useLocalProfileContext";

export default function useAppMenuItems() {
  const { openRoute } = useAppRoutesContext();

  /*
  const {
    outgoingMediaStreamTracks,
    outgoingAudioMediaStreamTracks,
    outgoingVideoMediaStreamTracks,
    incomingMediaStreamTracks,
    incomingAudioMediaStreamTracks,
    incomingVideoMediaStreamTracks,
  } = useZenRTCContext();
  */

  const { avatarURL: profileAvatarURL, name: profileName } =
    useLocalProfileContext();

  const {
    realmId,
    channelId,
    isConnected,
    isHostOnline,
    // participants,
    latency,
  } = useWebPhantomSessionContext();

  // IMPORTANT: These menu items are memoized in order to prevent their state
  // from clearing.
  //
  // (i.e. reproducible example was muting / unmuting microphone while a text
  // field is being typed in)
  //
  // There might be an easier way of accomplishing this

  const { micAudioController } = useInputMediaDevicesContext();

  const { isScreenSharingSupported, isScreenSharing, toggleScreenCapture } =
    useScreenCaptureContext();

  const menuItem__Profile = useMemo(
    () => ({
      name: `Profile`,
      buttonView: () => (
        <div style={{ paddingBottom: 5 }}>
          <Avatar src={profileAvatarURL} name={profileName} size="4em" />
        </div>
      ),
      onClick: () => openRoute(ROUTE_SETUP_PROFILE),
    }),
    [profileAvatarURL, profileName, openRoute]
  );

  const menuItem__Antenna = useMemo(
    () => ({
      name: "Network",
      onClick: () => openRoute(ROUTE_SETUP_NETWORKS),
      buttonView: () => {
        const signalStrength = isConnected
          ? getWebRTCSignalStrength(latency)
          : 0;

        return (
          <div>
            <div style={{ marginBottom: 34 }}>
              <SignalStrengthIndicator
                style={{
                  width: "1.4em",
                  height: "1.4em",
                }}
                signalStrength={signalStrength}
              />
            </div>

            <div
              style={{
                fontSize: ".8em",
                whiteSpace: "nowrap",
                position: "absolute",
                bottom: 4,
                left: 4,
                color: getPercentColor(signalStrength),
              }}
            >
              <div style={{ display: "inline-block", verticalAlign: "bottom" }}>
                <LatencyIcon style={{ fontSize: "2.8em" }} />
              </div>{" "}
              <div style={{ position: "absolute", bottom: -4, left: "3em" }}>
                {isConnected ? `${latency.toFixed(1)} ms` : "N/A"}
              </div>
            </div>

            <div
              style={{
                position: "absolute",
                right: 4,
                bottom: 4,
              }}
            >
              <ChangeIcon style={{ fontSize: "1.4em" }} />
            </div>
          </div>
        );
      },
    }),
    [isConnected, latency, openRoute]
  );

  const menuItem__ConnectDisconnect = useMemo(
    () => ({
      name: !isConnected ? "Connect" : "Disconnect",
      isDisabled: !isHostOnline,
      onClick: () =>
        !isConnected && realmId && channelId
          ? openRoute(ROUTE_CALL_URL, { realmId, channelId })
          : openRoute(ROUTE_CALL_DISCONNECT),
      buttonView: () => (
        <div style={{ paddingBottom: 15 }}>
          <PowerIcon
            style={{
              fontSize: "3.8em",
              color: !isHostOnline ? "gray" : isConnected ? "red" : "green",
            }}
          />
        </div>
      ),
    }),
    [isHostOnline, isConnected, openRoute, realmId, channelId]
  );

  const isMuted = micAudioController && micAudioController.getIsMuted();
  const toggleMute = useCallback(
    () => micAudioController && micAudioController.toggleMute(),
    [micAudioController]
  );

  const menuItem__Muting = useMemo(
    () => ({
      name:
        (!micAudioController && "Mic Off") ||
        `${isMuted ? "Unmute" : "Mute"} Mic`,
      onClick: toggleMute,
      isDisabled: !micAudioController,
      buttonView: () => (
        // TODO: Handle muting detection off of media devices context...
        <div>
          <div>
            <MicrophoneIcon
              // className={styles["icon"]}
              style={{
                marginLeft: 7,
                verticalAlign: "middle",
                fontSize: "2.8em",
                color: !micAudioController
                  ? "gray"
                  : !micAudioController.getIsMuted()
                  ? "red"
                  : "white",
              }}
            />
            {
              // TODO: Use outgoing mic audio level
            }
            <AudioMediaStreamTrackLevelMeter
              // TODO: Use all local media stream tracks
              mediaStreamTrack={(() => {
                const mediaStream =
                  micAudioController &&
                  micAudioController.getOutputMediaStream();

                if (mediaStream) {
                  // TODO: Make this more efficient
                  return mediaStream.getAudioTracks()[0];
                }
              })()}
              style={{
                marginLeft: 7,
                height: 40,
                marginBottom: 2,
                width: 10,
              }}
            />
          </div>
          <div
            style={{
              fontSize: ".8em",
              whiteSpace: "nowrap",
            }}
          >{`Mic ${
            !micAudioController
              ? "Off"
              : !micAudioController.getIsMuted()
              ? "Active"
              : "Muted"
          }`}</div>
        </div>
      ),
    }),
    [micAudioController, isMuted, toggleMute]
  );

  /*
  const menuItem__Participants = useMemo(
    () => ({
      name: `Participants`,
      view: ({ ...params }) => <ParticipantsApplet {...params} />,
      buttonView: () => (
        <React.Fragment>
          <div style={{ paddingBottom: 10 }}>
            <PeopleIcon
              // className={styles["icon"]}
              style={{ fontSize: "3.0em" }}
            />
          </div>
          <div
            style={{
              fontSize: ".8em",
              whiteSpace: "nowrap",
            }}
          >
            {participants.length} connected
          </div>
        </React.Fragment>
      ),
      isDisabled: !isConnected,
    }),
    [isConnected, participants]
  );
  */

  const menuItem__ScreenShare = useMemo(
    () => ({
      name: "Screen Share",
      buttonView: () => (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          {
            // TODO: Use screen capture track (Don't just use first outgoing video media stream track)
          }
          {/*isScreenSharing &&
          outgoingVideoMediaStreamTracks.length &&
          outgoingVideoMediaStreamTracks[0] ? (
            <Center>
              <Video mediaStreamTrack={outgoingVideoMediaStreamTracks[0]} />
            </Center>
          ) : null*/}

          <div
            style={{
              position: "absolute",
              bottom: 24,
              width: "100%",
              textAlign: "center",
            }}
          >
            <ScreenShareIcon
              // className={styles["icon"]}
              style={{ fontSize: "2.8em" }}
            />
          </div>

          <div style={{ position: "absolute", bottom: 0, width: "100%" }}>
            <LED
              color={!isScreenSharing ? "gray" : "red"}
              style={{ verticalAlign: "bottom" }}
            />
          </div>
        </div>
      ),
      onClick: toggleScreenCapture,
      isDisabled: !isScreenSharingSupported || !isConnected,
    }),
    [
      isConnected,
      isScreenSharingSupported,
      isScreenSharing,
      toggleScreenCapture,
    ]
  );

  /*
  const menuItem__AudioIO = useMemo(
    () => ({
      name: "Audio Devices",
      view: ({ ...params }) => (
        <AudioVideoIOApplet {...params} defaultDisplayFilterType="audio" />
      ),
      buttonView: () => {
        const mediaStreamTrackViews = [
          ...(outgoingAudioMediaStreamTracks || []),
          ...(incomingAudioMediaStreamTracks || []),
        ]
          .filter(({ kind }) => kind === "audio")
          .map((mediaStreamTrack, idx) => (
            <AudioMediaStreamTrackLevelMeter
              key={idx}
              mediaStreamTrack={mediaStreamTrack}
              style={{ height: 40, width: 10, marginBottom: 4 }}
            />
          ));

        return (
          <div>
            <div>
              {!mediaStreamTrackViews.length ? (
                <AudioMediaStreamTrackLevelMeter
                  style={{ height: 40, width: 10, marginBottom: 4 }}
                  mediaStreamTrack={null}
                />
              ) : (
                mediaStreamTrackViews
              )}
            </div>
            <div style={{ fontSize: ".8em" }}>
              {incomingAudioMediaStreamTracks.length} In /{" "}
              {outgoingAudioMediaStreamTracks.length} Out
            </div>
          </div>
        );
      },
      // isDisabled: !isConnected,
    }),
    [
      // isConnected,
      outgoingAudioMediaStreamTracks,
      incomingAudioMediaStreamTracks,
    ]
  );
  */

  /*
  const menuItem__VideoIO = useMemo(
    () => ({
      name: "Video Devices",
      view: ({ ...params }) => (
        <AudioVideoIOApplet {...params} defaultDisplayFilterType="video" />
      ),
      buttonView: () => {
        // VideoCameraIcon


        return (
          <div>
            <div style={{ paddingBottom: 10 }}>
              <VideoCameraIcon
                style={{
                  fontSize: "3.4em",
                }}
              />
            </div>

            <div style={{ fontSize: ".8em" }}>
              {incomingVideoMediaStreamTracks.length} In /{" "}
              {outgoingVideoMediaStreamTracks.length} Out
            </div>
          </div>
        );
      },
      // isDisabled: !isConnected,
    }),
    [
      // isConnected,
      outgoingVideoMediaStreamTracks,
      incomingVideoMediaStreamTracks,
    ]
  );
  */

  /*
  const menuItem__TTS = useMemo(
    () => ({
      name: "Text-to-Speech",
      view: ({ ...params }) => <TTSApplet {...params} />,
      isDisabled: !isConnected,
      buttonView: () => (
        <div style={{ paddingBottom: 15 }}>
          <TextIcon
            // className={styles["icon"]}
            style={{ fontSize: "3.8em" }}
          />
        </div>
      ),
    }),
    [isConnected]
  );
  */

  /*
  const menuItem__MusicCreator = useMemo(
    () => ({
      name: "Music Creator",
      view: ({ ...params }) => (
        <MusicCreatorApplet
          outgoingMediaStreamTracks={outgoingMediaStreamTracks}
          incomingMediaStreamTracks={incomingMediaStreamTracks}
          {...params}
        />
      ),
      buttonView: () => (
        <div style={{ paddingBottom: 15 }}>
          <MusicIcon
            style={{
              fontSize: "3.8em",
            }}
          />
        </div>
      ),
      isDisabled: !isConnected,
    }),
    [isConnected, outgoingMediaStreamTracks, incomingMediaStreamTracks]
  );
  */

  const menuItem__ChatApplet = useMemo(
    () => ({
      name: "Chat",
      isDisabled: !isConnected,
      view: ({ ...params }) => <ChatApplet {...params} />,
      buttonView: () => (
        <div style={{ paddingBottom: 15 }}>
          <ChatIcon
            // className={styles["icon"]}
            style={{ fontSize: "3.8em" }}
          />
        </div>
      ),
    }),
    [isConnected]
  );

  /*
  const menuItem__MediaSharingApplet = useMemo(
    () => ({
      name: "Media Sharing",
      isDisabled: false,
      view: ({ ...params }) => <MediaSharingApplet {...params} />,
      buttonView: () => (
        <div style={{ paddingBottom: 15 }}>
          <HardDriveIcon
            // className={styles["icon"]}
            style={{ fontSize: "3.8em" }}
          />
        </div>
      ),
    }),
    []
  );
  */

  /*
  const menuItem__TensorFlowApplet = useMemo(
    () => ({
      name: "TensorFlow",
      isDisabled: false,
      view: ({ ...params }) => <TensorFlowApplet {...params} />,
      buttonView: () => (
        <div style={{ paddingBottom: 15 }}>
          <TensorFlowIcon
            // className={styles["icon"]}
            style={{ fontSize: "3.8em" }}
          />
        </div>
      ),
    }),
    []
  );
  */

  /*
  // For background setting
  const menuItem__CustomizeApplet = useMemo(
    () => ({
      name: "Background",
      isDisabled: !isConnected,
      view: ({ ...params }) => <CustomizationApplet {...params} />,
      buttonView: () => (
        <div style={{ paddingBottom: 15 }}>
          <CustomizeIcon
            // className={styles["icon"]}
            style={{ fontSize: "3.8em" }}
          />
        </div>
      ),
    }),
    [isConnected]
  );
  */

  /*
  const menuItem__SearchApplet = useMemo(
    () => ({
      name: "Search",
      isDisabled: !isConnected,
      view: ({ ...params }) => <SearchApplet {...params} />,
      buttonView: () => (
        <div style={{ paddingBottom: 15 }}>
          <SearchIcon
            // className={styles["icon"]}
            style={{ fontSize: "3.8em" }}
          />
        </div>
      ),
    }),
    [isConnected]
  );
  */

  /*
  const menuItem__DrawApplet = useMemo(
    () => ({
      name: "Draw",
      isDisabled: !isConnected,
      view: ({ ...params }) => <DrawApplet {...params} />,
      buttonView: () => (
        <div style={{ paddingBottom: 15 }}>
          <DrawIcon
            // className={styles["icon"]}
            style={{ fontSize: "3.8em" }}
          />
        </div>
      ),
    }),
    [isConnected]
  );
  */

  const menuItem__SettingsApplet = useMemo(
    () => ({
      name: "Settings",
      onClick: () => openRoute(ROUTE_SETUP_CONFIGURE),
      buttonView: () => (
        <div style={{ paddingBottom: 15 }}>
          <SettingsIcon
            // className={styles["icon"]}
            style={{ fontSize: "3.8em" }}
          />
        </div>
      ),
    }),
    [openRoute]
  );

  const menuItem__InfoApplet = useMemo(
    () => ({
      name: "Info",
      isDisabled: false,
      view: ({ ...params }) => <InfoApplet {...params} />,
      buttonView: () => (
        <div style={{ paddingBottom: 15 }}>
          <InfoIcon
            // className={styles["icon"]}
            style={{ fontSize: "3.8em" }}
          />
        </div>
      ),
    }),
    []
  );

  // TODO: Don't show if running in standalone mode
  /*
  const menuItem__FullScreen = useMemo(
    () => ({
      name: "Full Screen",
      // isDisabled: true,

      // TODO: Refactor into other component
      view: () => (
        <Center>
          <div>
            <button style={{ width: 150, height: 100, fontWeight: "bold" }}>
              Minimal UI
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  width: "100%",
                  fontWeight: "normal",
                }}
                className="note"
              >
                Hide UI controls
              </div>
            </button>{" "}
            <button style={{ width: 150, height: 100, fontWeight: "bold" }}>
              Full Screen
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  width: "100%",
                  fontWeight: "normal",
                }}
                className="note"
              >
                Hide operating system
              </div>
            </button>
          </div>
        </Center>
      ),
      buttonView: () => (
        <div style={{ paddingBottom: 15 }}>
          <FullScreenIcon
            // className={styles["icon"]}
            style={{ fontSize: "3.8em" }}
          />
        </div>
      ),
    }),
    []
  );
  */

  const menuItem__ShareApplet = useMemo(
    () => ({
      name: "Share",
      isDisabled: !isConnected,
      view: ({ ...params }) => <ShareApplet {...params} />,
      buttonView: () => (
        <div style={{ paddingBottom: 15 }}>
          <ShareIcon
            // className={styles["icon"]}
            style={{ fontSize: "3.8em", color: "orange" }}
          />
        </div>
      ),
    }),
    [isConnected]
  );

  /*
  const menuItem__PairingApplet = useMemo(
    () => ({
      name: "Device Pairing",
      isDisabled: true,
      view: ({ ...params }) => (
        <div>[TODO: Implement Device Pairing / QR Code]</div>
      ),
      buttonView: () => (
        <div style={{ paddingBottom: 20 }}>
          <PairingIcon
            // className={styles["icon"]}
            style={{ fontSize: "1.4em" }}
          />
        </div>
      ),
    }),
    []
  );
  */

  /*
  const menuItem__ScratchPad = useMemo(
    () => ({
      name: "ScratchPad",
      buttonView: () => (
        <div style={{ paddingBottom: 20 }}>
          <NotepadIcon
            // className={styles["icon"]}
            style={{ fontSize: "1.4em" }}
          />
        </div>
      ),
      isDisabled: true, // !isConnected,
    }),
    []
  );
  */

  /*
  const menuItem__SoundEffects = useMemo(
    () => ({
      name: "Sound Effects",
      view: () => <div>[Sound Effects]</div>,
      isDisabled: true, // !isConnected,
    }),
    []
  );
  */

  /*
  const menuItem__GameController = useMemo(
    () => ({
      name: "Game Controller",
      view: ({ ...params }) => (
        <DynamicControllersContainerApplet {...params} />
      ),
      isDisabled: true, // !isConnected,
    }),
    []
  );
  */

  return [
    menuItem__Profile,
    menuItem__Antenna,
    menuItem__ConnectDisconnect,
    // menuItem__Participants,
    menuItem__Muting,
    menuItem__ScreenShare,
    // menuItem__FullScreen,
    // menuItem__AudioIO,
    // menuItem__VideoIO,
    // menuItem__TTS,
    // menuItem__MusicCreator,
    // menuItem__MediaSharingApplet,
    // menuItem__TensorFlowApplet,
    menuItem__ChatApplet,
    // menuItem__CustomizeApplet,
    // menuItem__DrawApplet,
    // menuItem__SearchApplet,
    menuItem__SettingsApplet,
    menuItem__ShareApplet,
    menuItem__InfoApplet,
    // --
    // menuItem__PairingApplet,
    // menuItem__ScratchPad,
    // menuItem__SoundEffects,
    // menuItem__GameController,
  ];
}
