import sdpTransform from "sdp-transform";

export default class SDPAdapter {
  // TODO: Rename
  /**
   * Returns a modified SDP with the preferred audio codecs.
   *
   * Note, it currently filters out any codecs which are not in the preferred
   * list.
   *
   * Some guidance drawn from this:
   * @see https://medium.com/@peatiscoding/enough-understanding-of-sdp-for-switching-the-codec-a1cae6c0cbbc
   *
   * RTP Payload Format for the Opus Speech and Audio Codec:
   * @see https://tools.ietf.org/html/rfc7587
   *
   * Opus maximum bitrate is 520kb/s stereo (260kps per channel); Actual
   * bitrate depends on network and signal strength.
   * @see https://github.com/kmturley/webrtc-radio
   *
   * Stack Overflow: Is it really possible for WebRTC to stream high-quality
   * audio without noise?
   * @see https://stackoverflow.com/questions/46063374/is-it-really-possible-for-webrtc-to-stream-high-quality-audio-without-noise
   *
   * Stack Overflow: How to set up SDP for high-quality Opus audio
   * @see https://stackoverflow.com/questions/33649283/how-to-set-up-sdp-for-high-quality-opus-audio
   *
   * MDN: Codecs used by WebRTC
   * @see https://developer.mozilla.org/en-US/docs/Web/Media/Formats/WebRTC_codecs
   *
   * @param {string} sdp
   * @param {string[]} preferredAudioCodecs? [default=["opus"]]
   * @param {number} maxAverageBitrate? [default=510000] Currently only affects
   * Opus codec.
   * @param {boolean} isStereo? [default=true]
   * @return {string}
   */
  static setPreferredAudioCodecs(
    sdp,
    preferredAudioCodecs = ["opus"],
    maxAverageBitrate = 510000,
    isStereo = true
  ) {
    // Normalize the array w/ uppercase entries
    preferredAudioCodecs = preferredAudioCodecs.map(codec =>
      codec.toUpperCase()
    );

    // Type-case to integer (this value will be run inline to configure fmtp
    // below)
    maxAverageBitrate = parseInt(maxAverageBitrate, 10);

    const parsedSDP = sdpTransform.parse(sdp);

    parsedSDP.media = parsedSDP.media.map(media => {
      if (media.type === "audio") {
        const preferredPayloads = [];

        media.rtp = media.rtp.filter(({ codec, payload }) => {
          codec = codec.toUpperCase();

          const isPreferredCodec = preferredAudioCodecs.includes(codec);

          if (isPreferredCodec) {
            preferredPayloads.push(payload);
          }

          return isPreferredCodec;
        });

        media.payloads = preferredPayloads.join(" ");

        media.fmtp = media.fmtp
          .filter(({ payload }) => preferredPayloads.includes(payload))
          .map(fmtp => {
            // stereo=1;
            // @see https://stackoverflow.com/questions/33649283/how-to-set-up-sdp-for-high-quality-opus-audio
            // @see https://tools.ietf.org/html/rfc7587
            fmtp.config = fmtp.config.replace(
              "useinbandfec=1",
              `useinbandfec=1;maxaveragebitrate=${maxAverageBitrate};stereo=${
                Boolean(isStereo) ? 1 : 0
              }`
            );

            return fmtp;
          });
      }

      return media;
    });

    return sdpTransform.write(parsedSDP);
  }
}
