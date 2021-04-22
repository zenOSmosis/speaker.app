/**
 * @return {Promise<AudioContext>} Resolves to singleton AudioContext instance
 * after it has been initialized (i.e. via user interaction, etc.)
 */
const fetchAudioContext = (() => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContext = AudioContext ? new AudioContext() : null;

  return async () => {
    // Note: This is not documented in https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
    // Found this fix: https://github.com/Tonejs/Tone.js/issues/341#issuecomment-386725880
    const isRunning = audioContext.state === "running";

    // Due to browsers' autoplay policy, the AudioContext is only active after
    // the user has interacted with your app, after which the Promise returned
    // here is resolved.
    if (!isRunning) {
      console.debug("Trying to resume audio context");

      await audioContext.resume();

      console.debug("Audio context resumed");
    }

    return audioContext;
  };
})();

export default fetchAudioContext;
