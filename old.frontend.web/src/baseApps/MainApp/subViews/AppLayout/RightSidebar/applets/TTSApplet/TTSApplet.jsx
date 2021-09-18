import React, { useCallback, useEffect, useRef, useState } from "react";
import Center from "@components/Center";
import { SYNC_EVT_TTS } from "@shared/syncEvents";

export default function TTSApplet({ zenRTCPeer, isZenRTCConnected, ...rest }) {
  const [speakerSex, setSpeakerSex] = useState("female");
  const [text, setText] = useState("");

  const refTextarea = useRef(null);

  useEffect(() => {
    setTimeout(
      () => refTextarea && refTextarea.current && refTextarea.current.focus(),
      100
    );
  }, []);

  const handleTextChange = useCallback((evt) => {
    const text = evt.target.value;

    setText(text);
  }, []);

  const handleSpeak = useCallback(() => {
    if (!zenRTCPeer) {
      console.warn("No zenRTCPeer available to speak with");
      return;
    }

    if (!text || !text.length) {
      return;
    }

    // TODO: Use constant
    zenRTCPeer.emitSyncEvent(SYNC_EVT_TTS, { sex: speakerSex, text });

    setText("");
  }, [zenRTCPeer, speakerSex, text]);

  return (
    <Center>
      <textarea
        ref={refTextarea}
        style={{ width: "100%", resize: "none" }}
        placeholder="Enter some text to speak"
        onChange={handleTextChange}
        onKeyUp={(evt) => {
          // TODO: Move this handling into keyUp handler
          const { which } = evt;

          // TODO: Use switch statement
          if (which === 27) {
            setText("");
          }
          if (which === 13) {
            handleSpeak();
          }
        }}
        value={text}
      />

      <div style={{ overflow: "auto" }}>
        <div style={{ float: "left", whiteSpace: "nowwrap" }}>
          <button
            onClick={() => setSpeakerSex("female")}
            disabled={speakerSex === "female"}
          >
            Female
          </button>{" "}
          |{" "}
          <button
            onClick={() => setSpeakerSex("male")}
            disabled={speakerSex === "male"}
          >
            Male
          </button>
        </div>

        <div style={{ float: "right" }}>
          <button disabled>Archive</button> |{" "}
          <button onClick={handleSpeak} disabled={!text || !text.length}>
            Speak
          </button>
        </div>
      </div>

      <div className="note" style={{ clear: "both", marginTop: 20 }}>
        Note: Spoken text will be broadcast to all participants.
      </div>

      <div style={{ marginTop: 20 }}>
        [TODO: Add STT input, where available]
      </div>
    </Center>
  );
}
