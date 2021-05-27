import React, { useCallback, useState } from "react";
import Layout, { Content, Section } from "@components/Layout";
import useKeyboardEvents from "@hooks/useKeyboardEvents";
import { SYNC_EVT_MIDI_NOTE } from "@shared/syncEvents";
// import midiInstruments, { TYPE_STRINGED } from "@shared/midi/midiInstruments";
import TabKey from "@components/computerKeyboardKeys/TabKey";
import UpKey from "@components/computerKeyboardKeys/UpKey";
import DownKey from "@components/computerKeyboardKeys/DownKey";
import RightKey from "@components/computerKeyboardKeys/RightKey";
import LeftKey from "@components/computerKeyboardKeys/LeftKey";
import { LCD } from "@components/fontFaces";
import LED from "@components/LED";
import ButtonTransparent from "@components/ButtonTransparent";
import MusicKeyboard from "@components/MusicKeyboard";
import { AudioLoopCreatorViewController } from "@components/AudioLoopCreator";

import EditorIcon from "@icons/EditorIcon";
import MusicKeyboardIcon from "@icons/MusicKeyboardIcon";
import SpringIcon from "@icons/SpringIcon";

import useAppLayoutContext from "@hooks/useAppLayoutContext";
import useMusicInstrumentChannel from "@hooks/useMusicInstrumentChannel";

import { getMapWithKeyCode } from "@shared/midi/computerKeyboardMap";

export default function MusicCreatorApplet({
  // TODO: Obtain from context
  zenRTCPeer,
  isZenRTCConnected,
  // outgoingMediaStreamTracks = [],
  // incomingMediaStreamTracks = [],
}) {
  const { setMainView } = useAppLayoutContext();

  const {
    isSustain,
    toggleSustain,
    octaveIdx,
    setOctaveIdx,
    decreaseOctaveIdx,
    increaseOctaveIdx,
    instrumentId,
    setInstrumentId,
    volume,
    setVolume,
    stringedInstruments,
  } = useMusicInstrumentChannel();

  const [isSpringyOctaveEnabled, setIsSpringyOctaveEnabled] = useState(true);

  const handleLeftKeyDown = useCallback(() => {
    decreaseOctaveIdx();
  }, [decreaseOctaveIdx]);

  const handleLeftKeyUp = useCallback(() => {
    if (isSpringyOctaveEnabled) {
      increaseOctaveIdx();
    }
  }, [isSpringyOctaveEnabled, increaseOctaveIdx]);

  const handleRightKeyDown = useCallback(() => {
    increaseOctaveIdx();
  }, [increaseOctaveIdx]);

  const handleRightKeyUp = useCallback(() => {
    if (isSpringyOctaveEnabled) {
      decreaseOctaveIdx();
    }
  }, [isSpringyOctaveEnabled, decreaseOctaveIdx]);

  useKeyboardEvents({
    isEnabled: true,
    onKeyDown: keyCode => {
      switch (keyCode) {
        case 49: // 1
        case 97: // Number pad 1
          setOctaveIdx(0);
          break;

        case 50: // 2
        case 98: // Number pad 2
          setOctaveIdx(1);
          break;

        case 51: // 3
        case 99: // Number pad 3
          setOctaveIdx(2);
          break;

        case 52: // 4
        case 100: // Number pad 4
          setOctaveIdx(3);
          break;

        default:
          if (isZenRTCConnected) {
            const map = getMapWithKeyCode(keyCode);

            if (map) {
              // TODO: Remove
              console.log({
                note: map.note,
              });

              // TODO: Rework this
              zenRTCPeer.emitSyncEvent(SYNC_EVT_MIDI_NOTE, {
                note: map.note,
                octaveIdx: map.octaveIdx + octaveIdx,
                instrumentId,
                volume,
              });
            }
          }
      }
    },
    onKeyUp: keyCode => {
      if (!isSustain) {
        if (isZenRTCConnected) {
          const map = getMapWithKeyCode(keyCode);

          // TODO: Only release if not sustaining
          if (map) {
            // TODO: Rework this
            zenRTCPeer.emitSyncEvent(SYNC_EVT_MIDI_NOTE, {
              note: map.note,
              octaveIdx: map.octaveIdx + octaveIdx,
              release: true, // Note this is for releasing the note
              instrumentId,
              volume,
            });
          }
        }
      }
    },
  });

  return (
    <Layout>
      <Content>
        <div style={{ width: "100%", height: "100%", overflowY: "auto" }}>
          <Section>
            <h1>Lead Instrument</h1>

            <div>
              <select onChange={evt => setInstrumentId(evt.target.value)}>
                {stringedInstruments.map(({ name, id }, idx) => (
                  <option key={idx} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </Section>

          <Section>
            <h1>Key Bindings</h1>
            <div>
              <TabKey
                isActive={isSustain}
                onClick={toggleSustain}
                secondaryLabel="Sustain"
              />

              {
                // TODO: Convert this into separate component
              }
              <div
                style={{
                  display: "inline-block",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    overflow: "nowrap",
                  }}
                >
                  <div>
                    <UpKey
                      secondaryLabel="Vol +"
                      onClick={() => setVolume(volume + 1)}
                    />
                  </div>
                  <div>
                    <LeftKey
                      onKeyDown={handleLeftKeyDown}
                      onKeyUp={handleLeftKeyUp}
                      secondaryLabel="Oct -"
                    />
                    <DownKey
                      secondaryLabel="Vol -"
                      onClick={() => setVolume(volume - 1)}
                    />
                    <RightKey
                      onKeyDown={handleRightKeyDown}
                      onKeyUp={handleRightKeyUp}
                      secondaryLabel="Oct +"
                    />
                  </div>
                  <div>
                    <span style={{ whiteSpace: "nowrap" }}>
                      Volume: <LCD>{volume}</LCD>
                    </span>
                    {" -- "}
                    <span style={{ whiteSpace: "nowrap" }}>
                      Octave: <LCD>{octaveIdx + 1}</LCD>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ margin: 10 }}>
              <button
                onClick={() =>
                  setIsSpringyOctaveEnabled(isEnabled => !isEnabled)
                }
              >
                Springy Octave <SpringIcon />{" "}
                <LED color={isSpringyOctaveEnabled ? "green" : "gray"} />
              </button>
              <div className="note">
                Springy Octave binds to L / R keyup to reset octave.
              </div>
            </div>

            <div className="note" style={{ paddingTop: 10, textAlign: "left" }}>
              <p>
                Note: Volume and sustain are a bit buggy in that if you change
                the volume while sustain is off and playing a note at the same
                time, the note will sustain.
              </p>
              <p>
                Also, volume will only adjust the next note played, not the
                current.
              </p>
            </div>
          </Section>

          <Section>
            <h1>Utils</h1>

            <div style={{ display: "inline-block" }}>
              <ButtonTransparent
                onClick={() => setMainView(() => <MusicKeyboard />)}
              >
                <div>
                  <MusicKeyboardIcon />
                </div>
                <div>Open Music Keyboard</div>
              </ButtonTransparent>

              <ButtonTransparent
                onClick={() =>
                  setMainView(() => (
                    <AudioLoopCreatorViewController
                      zenRTCPeer={zenRTCPeer}
                      isZenRTCConnected={isZenRTCConnected}
                      onClose={() => setMainView(null)}
                    />
                  ))
                }
              >
                <div>
                  <EditorIcon />
                </div>
                <div>Open Loop Editor</div>
              </ButtonTransparent>
            </div>
          </Section>
        </div>
      </Content>

      {/*
        <Footer>
        {[...outgoingMediaStreamTracks, ...incomingMediaStreamTracks]
          .filter(({ kind }) => kind === "audio")
          .map((mediaStreamTrack, idx) => (
            <AudioMediaStreamTrackLevelMeter
              key={idx}
              mediaStreamTrack={mediaStreamTrack}
              style={{ height: 50, width: 10 }}
            />
          ))}
      </Footer>
        */}
    </Layout>
  );
}
