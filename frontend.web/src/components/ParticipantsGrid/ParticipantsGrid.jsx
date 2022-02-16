import React from "react";
import Full from "../Full";
import Participant from "./Participant";
import Center from "../Center";

import useWebPhantomSessionContext from "@hooks/useWebPhantomSessionContext";

export default function ParticipantsGrid() {
  const { participants } = useWebPhantomSessionContext();

  return (
    <Full style={{ overflow: "auto" }}>
      <Center canOverflow={true}>
        {participants
          .sort((a, b) => (!a.isLocal && !b.isLocal ? 0 : b.isLocal ? -1 : 1))
          .map((participant, idx) => {
            return <Participant key={idx} participant={participant} />;
          })}
      </Center>
    </Full>
  );
}
