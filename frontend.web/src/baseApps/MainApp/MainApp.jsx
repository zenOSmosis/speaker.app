import React, { useCallback, useEffect, useMemo, useRef } from "react";
import * as routes from "./routes";

import { useHistory } from "react-router";

import { MultiAudio } from "@components/AV";
import FullViewport from "@components/FullViewport";
import Center from "@components/Center";
import IDCard from "@components/IDCard";

import AppLayout from "./subViews/AppLayout";

import SplitAppMessageBusProvider, {
  ROLE_MAIN_APP,
} from "@providers/SplitAppMessageBusProvider";
import AppRoutesProvider from "@providers/AppRoutesProvider";
import AppLayoutProvider from "@providers/AppLayoutProvider";
import NotificationsProvider from "@providers/NotificationsProvider";
import InputMediaDevicesProvider from "@providers/InputMediaDevicesProvider";
import ScreenCaptureProvider from "@providers/ScreenCaptureProvider";
import LocalProfileProvider from "@providers/LocalProfileProvider";
import WebZenRTCProvider from "@providers/WebZenRTCProvider";
import WebPhantomSessionProvider from "@providers/WebPhantomSessionProvider";
import SharedFilesProvider from "@providers/SharedFilesProvider";
import ChatMessagesProvider from "@providers/ChatMessagesProvider";

import TranscoderSandboxProvider from "./subProviders/TranscoderSandboxProvider";

import useZenRTCContext from "@hooks/useZenRTCContext";
import useInputMediaDevicesContext from "@hooks/useInputMediaDevicesContext";
import useScreenCaptureContext from "@hooks/useScreenCaptureContext";
import useLocalProfileContext from "@hooks/useLocalProfileContext";
import useNotificationsContext from "@hooks/useNotificationsContext";
import useAppLayoutContext from "@hooks/useAppLayoutContext";
import useOnce from "@hooks/useOnce";
import useChatMessagesContext from "@hooks/useChatMessagesContext";
import useSocketContext from "@hooks/useSocketContext";
import useWebPhantomSessionContext from "@hooks/useWebPhantomSessionContext";
import useRenderCount from "@hooks/useRenderCount";
import useAppRoutesContext from "@hooks/useAppRoutesContext";

import NetworkIcon from "@icons/NetworkIcon";

import SetupModal, { PROFILE_TAB } from "@baseApps/MainApp/subViews/SetupModal";

import sleep from "@shared/sleep";

import { ROUTE_HOME, ROUTE_SETUP_PROFILE } from "./routes";

export default function MainApp() {
  const handleOpenProfile = useCallback(
    ({ openProfileQuery, setModalView, setMainView, setIsSidebarOpen }) => {
      if (!openProfileQuery) {
        setModalView(<SetupModal selectedTab={PROFILE_TAB} />);
      } else {
        // Close the sidebar
        //
        // TODO: Check if viewport is wide enough to warrant needing to close
        setIsSidebarOpen(false);

        // Set ID card as main view
        setMainView(<IDCard participant={openProfileQuery} />);
      }
    },
    []
  );

  const { socket } = useSocketContext();

  if (!socket) {
    return <Center>Waiting on socket initialization</Center>;
  }

  // Enclose appView w/ required providers
  return (
    <SplitAppMessageBusProvider role={ROLE_MAIN_APP}>
      <TranscoderSandboxProvider>
        <InputMediaDevicesProvider>
          <ScreenCaptureProvider>
            <LocalProfileProvider>
              <WebZenRTCProvider>
                <WebPhantomSessionProvider>
                  <SharedFilesProvider>
                    <AppRoutesProvider routes={routes}>
                      <AppLayoutProvider onOpenProfile={handleOpenProfile}>
                        <NotificationsProvider>
                          <ChatMessagesProvider>
                            <MainAppView />
                          </ChatMessagesProvider>
                        </NotificationsProvider>
                      </AppLayoutProvider>
                    </AppRoutesProvider>
                  </SharedFilesProvider>
                </WebPhantomSessionProvider>
              </WebZenRTCProvider>
            </LocalProfileProvider>
          </ScreenCaptureProvider>
        </InputMediaDevicesProvider>
      </TranscoderSandboxProvider>
    </SplitAppMessageBusProvider>
  );
}

function MainAppView() {
  const zenRTCContext = useZenRTCContext();

  const {
    isSocketIoConnected,
    incomingAudioMediaStreamTracks,
    // incomingMediaStreamTracks,
    // outgoingMediaStreamTracks,
  } = zenRTCContext;

  // Ties-in ZenRTC into UI
  useTieIns();

  if (!isSocketIoConnected) {
    return (
      <FullViewport>
        {
          // TODO: Dynamically adjust message based on network connection state
        }
        <Center>Awaiting socket connection...</Center>
      </FullViewport>
    );
  }

  return (
    <React.Fragment>
      <AppLayout {...zenRTCContext} />

      {
        // Enable audio to be heard
        //
        // TODO: Add local input monitoring tracks here
      }
      <MultiAudio
        mediaStreamTracks={incomingAudioMediaStreamTracks}
        /*
        mediaStreamTracks={[
          ...incomingAudioMediaStreamTracks,
          ...(getMonitoringMediaStreamAudioTracks() || []),
        ]}
        */
      />
    </React.Fragment>
  );
}

// TODO: Refactor
function useTieIns() {
  const history = useHistory();
  const getRenderCount = useRenderCount();

  // Redirect to network setup on first render
  useEffect(() => {
    const renderCount = getRenderCount();

    // If initial render and on the home path, redirect to networks setup
    if (renderCount === 0 && history.location.pathname === ROUTE_HOME.path) {
      // Note this intentionally uses history.replace instead of openRoute()
      // because we want to replace the history immediately
      history.replace(ROUTE_HOME.redirectRoute.path);
    }
  }, [history, getRenderCount]);

  const {
    zenRTCPeer,
    connectCount,
    isConnected,
    realmId,
    channelId,

    // TODO: Re-intergrate
    setIsMuted,
    isMuted,
  } = useWebPhantomSessionContext();

  const {
    // hasUIMicPermission,
    setIsInCall,

    // TODO: Add / remove tracks based on this collection
    publishableAudioInputControllerCollection,
  } = useInputMediaDevicesContext();

  // Bind inputMediaDevices isOnCall state to isConnected
  useEffect(() => {
    setIsInCall(isConnected);
  }, [isConnected, setIsInCall]);

  // TODO: Re-handle track muting (mute should affect all published audio track controllers from InputMediaDevicesProvider)

  // TODO: Show UI notification when call starts and we're muted, or there are no audio input devices selected

  // TODO: Automatically start audio devices if UI permissions are enabled

  // TODO: Document
  // const inputDevicesMediaStream = useMemo(() => new MediaStream(), []);

  // TODO: Refactor w/ publishableAudioInputControllerCollection support
  //
  // Sync publishableInputMediaDeviceTrackControllers with zenRTCPeer instance, if connected
  //
  // This handles broadcasting of microphone / other media device inputs
  /*
  useEffect(() => {
    if (isConnected) {
      // @type {MediaStreamTrackControllerBase[]}
      const prev =
        getPreviousPublishableInputMediaDeviceTrackControllers() || [];

      // @type {MediaStreamTrackControllerBase[]}
      const removed = prev.filter(
        predicate =>
          !publishableInputMediaDeviceTrackControllers.includes(predicate)
      );

      // NOTE: Publishing duplicates is okay, as only the first is used
      // internally
      publishableInputMediaDeviceTrackControllers.forEach(controller =>
        zenRTCPeer.addOutgoingMediaStreamTrack(
          controller.getOutputMediaStreamTrack(),
          inputDevicesMediaStream
        )
      );

      // Unpublish removed tracks; While this works for automatically
      // destructed tracks, this handles "unselected" tracks which may be
      // currently in a "test" state via InputMediaDevicesProvider /
      // AudioInputDeviceSelector
      removed.forEach(controller => {
        const track = controller.getOutputMediaStreamTrack();

        // NOTE: track might not be available on destroyed controller, so check
        // for its presence first
        if (track) {
          zenRTCPeer.removeOutgoingMediaStreamTrack(
            track,
            inputDevicesMediaStream
          );
        }
      });
    }
  }, [
    inputDevicesMediaStream,
    isConnected,
    zenRTCPeer,
    getPreviousPublishableInputMediaDeviceTrackControllers,
    publishableInputMediaDeviceTrackControllers,
  ]);
  */

  const { screenCaptureMediaStreams, stopScreenCapture } =
    useScreenCaptureContext();

  const { avatarURL, name, description, isDirty } = useLocalProfileContext();

  const { showNotification } = useNotificationsContext();

  const {
    openProfile,
    resetSidebarMenu,
    setIsSidebarOpen,
    onSelectedIdxChange,
  } = useAppLayoutContext();

  const { addedMessages } = useChatMessagesContext();

  // Reset sidebar menu on disconnect, in case the user is in a section which
  // requires connectivity
  useEffect(() => {
    if (!isConnected) {
      resetSidebarMenu();
    }
  }, [isConnected, resetSidebarMenu]);

  // TODO: Move somewhere else?
  // Handle screensharing tie-in
  useEffect(() => {
    if (zenRTCPeer) {
      screenCaptureMediaStreams.forEach(mediaStream =>
        zenRTCPeer.publishMediaStream(mediaStream)
      );
    } else {
      stopScreenCapture();
    }
  }, [zenRTCPeer, screenCaptureMediaStreams, stopScreenCapture]);

  const { getIsCurrentRoute } = useAppRoutesContext();

  // Startup "you are" notification
  useOnce(() => {
    // TODO: Add ability to delay conditional evaluation directly in useOnce
    //
    // Don't display if landing on profile page in a new session
    if (!getIsCurrentRoute(ROUTE_SETUP_PROFILE)) {
      // Timeout added to allow UI to fully render before drawing notification,
      // which makes the loading a bit smoother
      setTimeout(() => {
        showNotification({
          image: avatarURL,
          title: `You are ${name}!`,
          onClick: openProfile,
          body: (
            <div>
              <p>{description}</p>

              <div style={{ float: "right", height: "1rem", width: "4rem" }}>
                <div
                  // Fake button
                  style={{
                    backgroundColor: "#347FE8",
                    marginLeft: 10,
                    position: "absolute",
                    bottom: 4,
                    right: 4,
                    padding: 4,
                    borderRadius: 4,
                  }}
                >
                  Update your Profile
                </div>
              </div>
            </div>
          ),
        });
      }, 500);
    }
  }, !isDirty && avatarURL && name && description);

  useEffect(() => {
    (async () => {
      // Outer "isConnected" is triggered by hook state
      if (isConnected) {
        // Sleep to show notification slightly after connecting (partly to try
        // to reduce CPU load during connection and initial stream
        // negotiations)
        await sleep(1000);

        // Inner "isConnected" is determined after sleep
        if (zenRTCPeer.getIsConnected()) {
          showNotification({
            image: <NetworkIcon style={{ fontSize: "2rem", color: "green" }} />,
            title: "You have connected!",
            // TODO: Show network name
            body: (
              <div>
                You are now in {realmId} / {channelId}.
              </div>
            ),
          });
        }
      }
    })();
  }, [isConnected, zenRTCPeer, showNotification, realmId, channelId]);

  const refPreviousRealmId = useRef(null);
  if (realmId) {
    refPreviousRealmId.current = realmId;
  }

  const refPreviousChannelId = useRef(null);
  if (channelId) {
    refPreviousChannelId.current = channelId;
  }

  useEffect(() => {
    if (!isConnected && connectCount > -1) {
      const previousRealmId = refPreviousRealmId.current;
      const previousChannelId = refPreviousChannelId.current;

      showNotification({
        image: <NetworkIcon style={{ fontSize: "2rem", color: "red" }} />,
        title: "You have disconnected",
        // TODO: Show network name
        body: (
          <div>
            The connection to {previousRealmId} / {previousChannelId} has been
            closed.
          </div>
        ),
      });
    }
  }, [isConnected, connectCount, showNotification]);

  const refSetIsSidebarOpen = useRef(setIsSidebarOpen);
  refSetIsSidebarOpen.current = setIsSidebarOpen;

  const refOnSelectedIdxChange = useRef(onSelectedIdxChange);
  refOnSelectedIdxChange.current = onSelectedIdxChange;
  useEffect(() => {
    if (addedMessages && addedMessages.length) {
      const setIsSidebarOpen = refSetIsSidebarOpen.current;
      const onSelectedIdxChange = refOnSelectedIdxChange.current;

      const lastAddedMessage = addedMessages[addedMessages.length - 1];

      if (lastAddedMessage.sender) {
        showNotification({
          image: lastAddedMessage.sender.avatarURL,
          title: `${lastAddedMessage.sender.name} wrote:`,
          body: lastAddedMessage.body,

          // Show messages when clicked
          onClick: () => {
            setIsSidebarOpen(true);

            // Activate chat applet when notification is clicked
            //
            // TODO: Remove this hardcoding and obtain from a variable
            onSelectedIdxChange(5);
          },
        });
      }
    }
  }, [addedMessages, showNotification]);
}
