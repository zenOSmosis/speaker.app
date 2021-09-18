import React from "react";
import ParticipantCard from "./ParticipantCard";

import useTranscoderPhantomSessionContext from "@baseApps/TranscoderApp/subHooks/useTranscoderPhantomSessionContext";

export default function ParticipantCards() {
  const { peers } = useTranscoderPhantomSessionContext();

  return !peers.length ? (
    <div>
      <p style={{ fontWeight: "bold" }}>No connected participants.</p>
    </div>
  ) : (
    peers.map((peer) => (
      <ParticipantCard key={peer.getSocketIoId()} peer={peer} />
    ))
  );
}
