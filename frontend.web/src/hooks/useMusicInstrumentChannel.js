import { useCallback, useMemo, useState } from "react";
import midiInstruments, { TYPE_STRINGED } from "@shared/midi/midiInstruments";

/**
 * Utility hook for live composition with music instruments.
 *
 * NOTE: The instrument is switchable internally to this hook.
 */
export default function useMusicInstrumentChannel() {
  const [isSustain, setIsSustain] = useState(true);
  const toggleSustain = useCallback(() => {
    setIsSustain((isSustain) => !isSustain);
  }, []);

  const [octaveIdx, setOctaveIdx] = useState(2);

  const decreaseOctaveIdx = useCallback(() => {
    if (octaveIdx > 0) {
      setOctaveIdx((octaveIdx) => --octaveIdx);
    }
  }, [octaveIdx]);

  const increaseOctaveIdx = useCallback(() => {
    if (octaveIdx < 3) {
      setOctaveIdx((octaveIdx) => ++octaveIdx);
    }
  }, [octaveIdx]);

  const [instrumentId, setInstrumentId] = useState(0);

  const [volume, _setVolume] = useState(4);

  const setVolume = useCallback((volume) => {
    if (volume >= 0 && volume <= 10) {
      _setVolume(volume);
    }
  }, []);

  const stringedInstruments = useMemo(
    () => midiInstruments.filter(({ type }) => type === TYPE_STRINGED),
    []
  );

  return {
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
  };
}
