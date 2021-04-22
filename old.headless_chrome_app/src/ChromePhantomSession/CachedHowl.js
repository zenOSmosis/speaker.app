import { Howl, Howler } from "howler";

const _instances = {};

// TODO: Document
export default function CachedHowl({ src, format = null, volume, ...rest }) {
  const cacheKey = JSON.stringify({ src, volume });

  if (_instances[cacheKey]) {
    return _instances[cacheKey];
  } else {
    _instances[cacheKey] = new Howl({
      html5: false,
      src,
      format,
      volume,
    });

    if (rest.length) {
      console.warn("CachedHowl ignored property list", JSON.stringify(rest));
    }

    return _instances[cacheKey];
  }
}

// Init Howler audio
const howlerMediaStream = (() => {
  Howler.mute(false); // to initialize Howler internals

  const streamOutput = Howler.ctx.createMediaStreamDestination();

  // first disconnect
  Howler.masterGain.disconnect();

  // then reconnect to our new destination
  Howler.masterGain.connect(streamOutput); // connect masterGain to destination

  // Start the audio timer (note, this doesn't have to be mounted to the DOM)
  const audioEl = document.createElement("audio");
  audioEl.srcObject = streamOutput.stream;

  return streamOutput.stream;
})();

export { howlerMediaStream };
