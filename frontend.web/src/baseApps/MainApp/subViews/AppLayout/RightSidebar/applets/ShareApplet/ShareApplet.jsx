import React from "react";

import Section from "@components/Section";
import Center from "@components/Center";
import QRCode from "@components/QRCode";

import useAppRoutesContext from "@hooks/useAppRoutesContext";

export default function ShareApplet() {
  const { networkURL } = useAppRoutesContext();

  if (!networkURL) {
    return <Center style={{ fontWeight: "bold" }}>No known network.</Center>;
  }

  return (
    <div style={{ width: "100%", height: "100%", overflowY: "auto" }}>
      <div className="note">
        Share this URL with others whom you wish to join the call.
      </div>

      <Section>
        <h2>URL</h2>
        {
          // TODO: Make copy-able
        }
        <textarea
          defaultValue={networkURL}
          readOnly
          style={{ height: "8em" }}
        />
      </Section>
      <Section>
        {
          // TODO: If this is too small, don't show QR code
        }
        <h2>QR Code</h2>
        <QRCode value={networkURL} />
      </Section>
    </div>
  );
}
