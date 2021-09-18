import React, {
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import AddIcon from "@icons/AddIcon";
import PlayIcon from "@icons/PlayIcon";
import ButtonTransparent from "@components/ButtonTransparent";

// TODO: Add ability to save / load page
// TODO: Add ability to set bar count
export default forwardRef(function AudioLoopCreatorHeader(
  {
    onAddTrack,
    isPlaying,
    isLooping,
    beatsPerBar,
    beatType,
    beatsPerMinute,
    onSetBeatsPerBar,
    onSetBeatType,
    onSetBeatsPerMinute,
    onSetIsPlaying,
    onSetIsLooping,
    onClose,
  },
  ref
) {
  const [currentBarBeat, setCurrentBarBeat] = useState("0.0");

  useImperativeHandle(
    ref,
    () => ({
      onProgress: ({ currentBarBeat }) => {
        setCurrentBarBeat(currentBarBeat);
      },
    }),
    []
  );

  // Time signature
  const handleTimeSignatureEquation = useCallback(
    (equation) => {
      const [beatsPerBar, beatType] = equation.split("/");

      onSetBeatsPerBar(beatsPerBar);
      onSetBeatType(beatType);
    },
    [onSetBeatsPerBar, onSetBeatType]
  );

  const currentTimeSignatureEquation = useMemo(
    () => `${beatsPerBar}/${beatType}`,
    [beatsPerBar, beatType]
  );

  return (
    <div
      style={{
        padding: "8px 0px",
        backgroundColor: "rgba(255,255,255,.1)",
        borderTop: "1px rgba(255,255,255,.2) solid",
      }}
    >
      <div style={{ position: "absolute", left: 0, whiteSpace: "nowrap" }}>
        <ButtonTransparent onClick={onAddTrack}>
          <div>
            <AddIcon />
          </div>
          <div>Add Track</div>
        </ButtonTransparent>
      </div>
      <div style={{ display: "inline-block", margin: "0px 8px" }}>
        <button
          onClick={() => onSetIsPlaying((isPlaying) => !isPlaying)}
          style={{
            backgroundColor: isPlaying ? "green" : "gray",
            padding: "4px 10px",
          }}
        >
          <PlayIcon />
        </button>
      </div>
      {
        // TODO: Build out
      }
      <div
        style={{
          display: "inline-block",
          margin: "0px 8px",
          verticalAlign: "middle",
        }}
      >
        {
          // TODO: Populate
        }
        <div>{currentBarBeat}</div>
        <div>Bar / Beat</div>
      </div>
      {
        // TODO: Build out
      }
      <div
        style={{
          display: "inline-block",
          margin: "0px 8px",
          verticalAlign: "middle",
        }}
      >
        <div>
          <select
            style={{ width: 50 }}
            defaultValue={currentTimeSignatureEquation}
            onChange={(evt) => handleTimeSignatureEquation(evt.target.value)}
          >
            {["3/4", "4/4", "5/4", "6/8", "7/8", "12/8", "8/4"].map(
              (equation, idx) => (
                <option key={idx} value={equation}>
                  {equation}
                </option>
              )
            )}
          </select>
        </div>
        <div>Signature</div>
      </div>
      {
        // TODO: Build out
      }
      <div
        style={{
          display: "inline-block",
          margin: "0px 8px",
          verticalAlign: "middle",
        }}
      >
        <div>
          <input
            type="number"
            value={beatsPerMinute}
            style={{ width: 50, textAlign: "center" }}
            step="10"
            onChange={(evt) =>
              onSetBeatsPerMinute(parseInt(evt.target.value, 10))
            }
          />
        </div>
        <div>Tempo</div>
      </div>
      {
        // TODO: Build out
      }
      <div
        style={{
          display: "inline-block",
          margin: "0px 8px",
          verticalAlign: "middle",
        }}
      >
        <div>
          <input
            type="checkbox"
            checked={isLooping}
            onChange={(evt) => onSetIsLooping(evt.target.checked)}
          />
        </div>
        <div>Loop</div>
      </div>
    </div>
  );
});
