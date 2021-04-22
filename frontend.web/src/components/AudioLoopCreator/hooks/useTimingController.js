import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function useAudioLoopController({
  isPlaying,
  isLooping,
  beatsPerMinute,

  // TODO: Rename where applicable
  // For time signature
  beatsPerBar,
  beatType,

  onComplete,

  onProgress = ({ percentage, beatIdx, currentBarBeat }) =>
    console.debug({
      percentage,
      beatIdx,
      currentBarBeat,
    }),
}) {
  const beatsPerSecond = useMemo(() => beatsPerMinute / 60, [beatsPerMinute]);

  const lenBeats = useMemo(() => beatsPerBar * beatType, [
    beatsPerBar,
    beatType,
  ]);

  const [playStartTime, setPlayStartTime] = useState(null);

  // Percentage elapsed, relevant to the current page
  // const [percentage, setPercentage] = useState(0);

  // Beat index, relevant to the current page
  // const [beatIdx, setBeatIdx] = useState(null);

  // const [currentBarBeat, setCurrentBarBeat] = useState("0.0");

  /**
   * @return {string}
   */
  const getCurrentBarBeat = useCallback(
    (beatIdx) => {
      const bar = Math.floor(beatIdx / beatsPerBar) + 1;
      const beat = (beatIdx % beatsPerBar) + 1;

      return `${bar}.${beat}`;
    },
    [beatsPerBar]
  );

  // Set / Reset start play time, based on is playing
  useEffect(() => {
    if (isPlaying) {
      setPlayStartTime(new Date().getTime());
    } else {
      setPlayStartTime(null);
    }
  }, [isPlaying]);

  // Restarts the looping sequence from the beginning
  const restart = useCallback(() => {
    setPlayStartTime(new Date().getTime());
    // setPercentage(0);
  }, []);

  // Prevent passing onComplete handler to useEffect
  const refOnComplete = useRef(onComplete);
  useEffect(() => {
    refOnComplete.current = onComplete;
  }, [onComplete]);

  const handleEnd = useCallback(() => {
    const onComplete = refOnComplete.current;
    onComplete();
  }, []);

  const pageDuration = useMemo(() => (lenBeats / beatsPerSecond) * 1000, [
    lenBeats,
    beatsPerSecond,
  ]);

  // TODO: Log current bar, current beat (in bar)

  useEffect(() => {
    if (isPlaying && playStartTime) {
      let _isUnmounting = false;

      const handleAnimationFrame = () => {
        if (_isUnmounting || !isPlaying) {
          return;
        }

        // TODO: Base this off of page time
        // Currently per-minute elapsed (not page-based)
        const elapsed = (new Date().getTime() - playStartTime) % 60000;

        // Percentage of minute elapsed
        // const minutePercentage = Math.floor((elapsed / 60000) * 100);
        let pagePercentage = (elapsed / pageDuration) * 100; // Math.floor((elapsed / pageDuration) * 100);
        if (pagePercentage > 100) {
          pagePercentage = 100;
        }
        // setPercentage(pagePercentage);

        if (pagePercentage < 100) {
          // Current beat index
          const beatIdx =
            (Math.ceil((beatsPerSecond * elapsed) / 1000) - 1) % lenBeats;

          onProgress({
            percentage: pagePercentage,
            beatIdx,
            currentBarBeat: getCurrentBarBeat(beatIdx),
          });

          window.requestAnimationFrame(handleAnimationFrame);
        } else {
          // If looping, restart, else, stop
          if (isLooping) {
            restart();
          } else {
            handleEnd();
          }
        }
      };

      // Start the page runner
      window.requestAnimationFrame(handleAnimationFrame);

      return function unmount() {
        _isUnmounting = true;
      };
    }
  }, [
    lenBeats,
    beatsPerSecond,
    isLooping,
    isPlaying,
    onProgress,
    pageDuration,
    playStartTime,
    getCurrentBarBeat,
    restart,
    handleEnd,
  ]);

  return {
    beatsPerSecond,
    pageDuration,

    // beatIdx,
    // currentBarBeat,
    // percentage,

    lenBeats, // TODO: Rename
  };
}
