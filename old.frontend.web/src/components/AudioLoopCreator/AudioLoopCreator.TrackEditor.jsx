import React, { useCallback, useMemo, useState } from "react";
import Center from "@components/Center";
import { getPercussionInstruments } from "@shared/midi/midiInstruments";

// TrackEditorOverlay
export default function TrackEditor({ isNewTrack, onSaveTrack, onClose }) {
  const percussionInstruments = useMemo(getPercussionInstruments, []);

  const [instrumentId, setInstrumentId] = useState(null);

  const handleSaveTrack = useCallback(() => {
    if (instrumentId) {
      onSaveTrack({ instrumentId: instrumentId });
    } else {
      console.warn("No instrument id");
    }
  }, [instrumentId, onSaveTrack]);

  return (
    <Center>
      <div style={{ width: 360, display: "inline-block" }}>
        <h1>{isNewTrack ? "Add" : "Edit"} Looping Track</h1>

        <select onChange={(evt) => setInstrumentId(evt.target.value)}>
          <option>Select instrument</option>
          {percussionInstruments.map(({ name, id }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <div>
          <button disabled={!instrumentId} onClick={handleSaveTrack}>
            {isNewTrack ? "Add" : "Update"}
          </button>
        </div>
        <div>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </Center>
  );
}
