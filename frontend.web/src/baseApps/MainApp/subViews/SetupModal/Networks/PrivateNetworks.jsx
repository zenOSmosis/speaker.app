import React, { useCallback, useState } from "react";
import Layout, { Header, Content } from "@components/Layout";
import Center from "@components/Center";

import NetworkTypeButtonPanelSection from "./NetworkTypeButtonPanelSection";

import { parseCallURL, ROUTE_CALL_URL } from "@baseApps/MainApp/routes";
import useAppRoutesContext from "@hooks/useAppRoutesContext";

export default function PrivateNetworks() {
  const [inputURL, setInputURL] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const { openRoute } = useAppRoutesContext();

  // TODO: Validate that URL is of the correct format

  const handleSubmit = useCallback(
    (evt) => {
      evt.preventDefault();

      const parsedURL = parseCallURL(inputURL);

      if (!parsedURL) {
        setErrorMessage("Network URL is invalid");
      } else {
        openRoute(ROUTE_CALL_URL, {
          realmId: parsedURL.realmId,
          channelId: parsedURL.channelId,
        });
      }
    },
    [inputURL, openRoute]
  );

  return (
    <Layout>
      <Header>
        <NetworkTypeButtonPanelSection />
      </Header>
      <Content>
        <Center canOverflow={true}>
          <form
            onSubmit={handleSubmit}
            style={{
              display: "inline-block",
              maxWidth: 640,
              textAlign: "left",
            }}
          >
            {
              // TODO: Add QR code option
            }

            <div className="note" style={{ marginBottom: 20 }}>
              <p>
                Private networks aren't searchable so pasting the URL, or using
                a QR code, are your primary options for entering a private
                network.
              </p>
            </div>

            <label>Private Network URL</label>

            <div>
              <input
                type="text"
                placeholder="https://speaker.app/network/..."
                onChange={(evt) => setInputURL(evt.target.value)}
                value={inputURL}
                style={{ width: "100%" }}
              />

              {errorMessage && (
                <div
                  className="note"
                  style={{ float: "left", color: "yellow" }}
                >
                  {errorMessage}
                </div>
              )}
            </div>

            <div style={{ float: "right" }}>
              <button disabled={!inputURL.trim().length}>Join</button>
            </div>
          </form>
        </Center>
      </Content>
    </Layout>
  );
}
