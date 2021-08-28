import React from "react";
import Full from "../Full";
import Participant from "./Participant";

import useWebPhantomSessionContext from "@hooks/useWebPhantomSessionContext";

export default function ParticipantsGrid() {
  const { participants } = useWebPhantomSessionContext();

  // TODO: Remove
  console.log({ participants });

  return (
    <Full>
      {participants.map((participant, idx) => {
        return <Participant key={idx} participant={participant} />;
      })}
    </Full>
  );
}
