import React, { useCallback, useEffect, useState } from "react";
import ButtonPanel from "@components/ButtonPanel";
import SystemModal from "@components/SystemModal";

import PropTypes from "prop-types";

import BackArrowIcon from "@icons/BackArrowIcon";
import InfoIcon from "@icons/InfoIcon";

import SetupModalFooter from "./SetupModalFooter";

import Profile from "./Profile";
import Networks, { PrivateNetworks } from "./Networks";
import CreateNetwork from "./CreateNetwork";
import Settings from "./Settings";

import ReturnIcon from "@icons/ReturnIcon";

import {
  ROUTE_CALL_URL,
  ROUTE_SETUP_PROFILE,
  ROUTE_SETUP_NETWORKS,
  ROUTE_SETUP_CREATE_NETWORK,
} from "@baseApps/MainApp/routes";

import useAppRoutesContext from "@hooks/useAppRoutesContext";
import useWebPhantomSessionContext from "@hooks/useWebPhantomSessionContext";

export const PROFILE_TAB = 0;
export const NETWORK_TAB = 1;
export const CREATE_NETWORK_TAB = 2;
export const PRIVATE_NETWORK_TAB = 3;
export const SETTINGS_TAB = 4;

SetupModal.propTypes = {
  selectedTab: PropTypes.number.isRequired,
};

export default function SetupModal({ selectedTab = NETWORK_TAB }) {
  const { openRoute } = useAppRoutesContext();
  const { isConnected, realmId, channelId } = useWebPhantomSessionContext();

  const [mainContent, _setMainContent] = useState(null);

  const handleAfterSaveCancelProfile = useCallback(() => {
    if (!isConnected) {
      openRoute(ROUTE_SETUP_NETWORKS);
    }
  }, [isConnected, openRoute]);

  useEffect(() => {
    switch (selectedTab) {
      case PROFILE_TAB:
        _setMainContent(
          <Profile
            // NOTE (jh): These are invoked after the cancelling /
            // saving has been stored
            onCancel={handleAfterSaveCancelProfile}
            onSave={handleAfterSaveCancelProfile}
          />
        );
        break;

      case NETWORK_TAB:
        _setMainContent(<Networks />);
        break;

      case PRIVATE_NETWORK_TAB:
        _setMainContent(<PrivateNetworks />);
        break;

      case CREATE_NETWORK_TAB:
        _setMainContent(<CreateNetwork />);
        break;

      case SETTINGS_TAB:
        _setMainContent(<Settings />);
        break;

      default:
        throw new Error(`Unknown tab "${selectedTab}"`);
    }
  }, [selectedTab, handleAfterSaveCancelProfile]);

  return (
    <SystemModal
      headerView={() => (
        <nav>
          <div style={{ float: "right" }}>
            <button
              style={{
                float: "right",
                margin: "0px .5em",
                borderRadius: "50%",
                width: "2em",
                backgroundColor: "#ccc",
                color: "#000",
              }}
            >
              <InfoIcon />
            </button>
            {isConnected ? (
              <button
                onClick={() =>
                  openRoute(ROUTE_CALL_URL, { realmId, channelId })
                }
                style={{ backgroundColor: "red", fontWeight: "bold" }}
              >
                <ReturnIcon
                  style={{
                    verticalAlign: "bottom",
                  }}
                />{" "}
                Return to call
              </button>
            ) : (
              <div
                style={{ marginTop: 8, display: "inline-block" }}
                className="note"
              >
                Not connected to a network.
              </div>
            )}
          </div>

          {
            // Primary tabs
          }
          {selectedTab === PROFILE_TAB ||
          selectedTab === NETWORK_TAB ||
          selectedTab === CREATE_NETWORK_TAB ? (
            <ButtonPanel
              style={{ display: "inline-block" }}
              buttons={[
                {
                  content: () => <span>Profile</span>,
                  onClick: () => openRoute(ROUTE_SETUP_PROFILE),
                  isSelected: selectedTab === PROFILE_TAB,
                },
                {
                  content: () => <span>Networks</span>,
                  onClick: () => openRoute(ROUTE_SETUP_NETWORKS),
                  isSelected: selectedTab === NETWORK_TAB,
                },
                {
                  content: () => <span>+ Create Network</span>,
                  onClick: () => openRoute(ROUTE_SETUP_CREATE_NETWORK),
                  isSelected: selectedTab === CREATE_NETWORK_TAB,
                },
              ]}
            />
          ) : (
            <button
              onClick={() =>
                !isConnected
                  ? openRoute(ROUTE_SETUP_NETWORKS)
                  : window.history.back()
              }
              style={{ color: "orange" }}
            >
              <BackArrowIcon style={{ verticalAlign: "middle" }} />{" "}
              <div style={{ display: "inline-block", verticalAlign: "middle" }}>
                Back
              </div>
            </button>
          )}
        </nav>
      )}
      footerView={<SetupModalFooter />}
    >
      {mainContent}
    </SystemModal>
  );
}
