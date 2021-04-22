import React, { useCallback } from "react";
import { Header, Row, Column } from "@components/Layout";
import ButtonTransparent from "@components/ButtonTransparent";
import Timer from "@components/Timer";
import Center from "@components/Center";
import Avatar from "@components/Avatar";
import Cover from "@components/Cover";

import DisconnectIcon from "@icons/DisconnectIcon";
import MenuIcon from "@icons/MenuIcon";
import CloseIcon from "@icons/CloseIcon";
import AntennaIcon from "@icons/AntennaIcon";
// import ShareIcon from "@icons/ShareIcon";

import classNames from "classnames";
import styles from "./AppHeader.module.css";

import {
  ROUTE_SETUP_PROFILE,
  ROUTE_SETUP_NETWORKS,
  ROUTE_CALL_DISCONNECT,
} from "@baseApps/MainApp/routes";

import useAppRoutesContext from "@hooks/useAppRoutesContext";
import useAppLayoutContext from "@hooks/useAppLayoutContext";
import useWebPhantomSessionContext from "@hooks/useWebPhantomSessionContext";
import useLocalProfileContext from "@hooks/useLocalProfileContext";

// TODO: Hide if there is main view content, or menu is shown, and we don't have much height

export default function AppHeader({ className }) {
  const { openRoute } = useAppRoutesContext();

  const {
    isSidebarOpen,
    setIsSidebarOpen,
    mainView,
    setMainView,
  } = useAppLayoutContext();

  const {
    realmId,
    channelId,
    isConnected,
    zenRTCPeer,
  } = useWebPhantomSessionContext();

  const {
    avatarURL: profileAvatarURL,
    name: profileAvatarName,
  } = useLocalProfileContext();

  const handleToggleSidebar = useCallback(() => {
    // NOTE: This handling is a bit different than the layout provider's
    // toggleSidebar method as this completely closes the sidebar and
    // doesn't back up to the menu panel home
    setIsSidebarOpen((isSidebarOpen) => !isSidebarOpen);

    if (mainView) {
      setMainView(null);
    }
  }, [mainView, setMainView, setIsSidebarOpen]);

  return (
    <Header>
      <Row className={classNames(styles["app-header"], className)}>
        <Column
          style={{
            width: 120,
            minWidth: 120,
            maxWidth: 120,
            backgroundColor: isConnected ? "purple" : "inherit",
          }}
        >
          <Cover style={{ opacity: 0.2 }}>
            <DisconnectIcon
              style={{ position: "absolute", left: 4, bottom: 4, fontSize: 40 }}
            />
          </Cover>
          <Cover>
            <Center>
              {isConnected && (
                <ButtonTransparent
                  onClick={() => openRoute(ROUTE_CALL_DISCONNECT)}
                >
                  <div>Disconnect</div>

                  <div>
                    {
                      // TODO: Use session uptime instead
                    }
                    <Timer
                      onTick={() => zenRTCPeer.getConnectionUptime()}
                      style={{ fontSize: ".8rem" }}
                    />
                  </div>
                </ButtonTransparent>
              )}
            </Center>
          </Cover>
        </Column>
        <Column>
          <Center>
            <ButtonTransparent
              className={classNames(
                styles["network"],
                !realmId || !channelId ? styles["no-network-selected"] : null
              )}
              onClick={() => openRoute(ROUTE_SETUP_NETWORKS)}
            >
              <div className={styles["content-outer-wrap"]}>
                <div className={styles["content-inner-wrap"]}>
                  {realmId && channelId ? (
                    <>
                      {realmId}
                      <br />
                      {channelId}
                    </>
                  ) : (
                    <>
                      No network selected
                      <br />
                    </>
                  )}

                  <div
                    style={{
                      position: "absolute",
                      left: 4,
                      top: -2,
                      fontSize: "2rem",
                      opacity: 0.4,
                    }}
                  >
                    <AntennaIcon />
                  </div>
                </div>
              </div>
            </ButtonTransparent>
          </Center>
        </Column>
        <Column style={{ width: 100, minWidth: 100, maxWidth: 100 }}>
          <Center>
            <div
              style={{
                width: "100%",
                textAlign: "right",
                whiteSpace: "nowrap",
                paddingRight: 4,
                overflow: "auto",
              }}
            >
              <ButtonTransparent onClick={() => openRoute(ROUTE_SETUP_PROFILE)}>
                <Avatar
                  src={profileAvatarURL}
                  name={profileAvatarName}
                  size={38}
                />
              </ButtonTransparent>
              <ButtonTransparent
                onClick={handleToggleSidebar}
                title={
                  mainView
                    ? "Close sub applet"
                    : isSidebarOpen
                    ? "Close menu"
                    : "Menu"
                }
              >
                {mainView || isSidebarOpen ? (
                  <CloseIcon
                    style={{
                      fontSize: 34,
                      verticalAlign: "middle",
                      color: "red",
                    }}
                  />
                ) : (
                  <MenuIcon
                    style={{
                      fontSize: 34,
                      verticalAlign: "middle",
                      color: isSidebarOpen ? "#059fff" : "inherit",
                    }}
                  />
                )}
              </ButtonTransparent>
            </div>
          </Center>
        </Column>
      </Row>
    </Header>
  );
}
