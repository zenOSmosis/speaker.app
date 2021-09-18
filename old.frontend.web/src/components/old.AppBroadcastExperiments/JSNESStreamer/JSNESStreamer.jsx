import React, { useCallback, useRef, useMemo, useState } from "react";
import jsnes from "jsnes";
import { useEffect } from "react";
import { EVT_DATA_RECEIVED } from "../../../WebZenRTCPeer";
import { CAPABILITY_REMOTE_KEYBOARD_GAME_INPUT } from "../../../shared/capabilities";

// @see https://github.com/bfirsh/jsnes/blob/master/example/nes-embed.js
const CANVAS_WIDTH = 256;
const CANVAS_HEIGHT = 240;
const CANVAS_FRAMEBUFFER_SIZE = CANVAS_WIDTH * CANVAS_HEIGHT;

export default function JSNESStreamer({
  // isSocketIoConnected,
  isZenRTCConnected,
  zenRTCPeer,
}) {
  // Adjust zenRTCPeer configuration for NES streaming
  useEffect(() => {
    if (!zenRTCPeer) {
      return;
    }

    zenRTCPeer.addCapability(CAPABILITY_REMOTE_KEYBOARD_GAME_INPUT);

    // TODO: Make these capabilities, instead?
    zenRTCPeer.setOfferToReceiveAudio(false);
    zenRTCPeer.setOfferToReceiveVideo(false);
  }, [zenRTCPeer]);

  const refCanvas = useRef(null);
  const refCanvasCtx = useRef(null);

  const refImage = useRef();
  const refFrameBufferU8 = useRef();
  const refFrameBufferU32 = useRef();

  const [videoMediaStreamTrack, setVideoMediaStreamTrack] = useState(null);

  // TODO: Map remote keyboards, etc.

  // Handle canvas setup
  useEffect(() => {
    setTimeout(() => {
      const canvas = refCanvas.current;
      refCanvasCtx.current = canvas.getContext("2d");

      const canvasCtx = refCanvasCtx.current;

      refImage.current = canvasCtx.getImageData(
        0,
        0,
        CANVAS_WIDTH,
        CANVAS_HEIGHT
      );

      let image = refImage.current;

      // Allocate framebuffer array
      const buffer = new ArrayBuffer(image.data.length);
      refFrameBufferU8.current = new Uint8ClampedArray(buffer);
      refFrameBufferU32.current = new Uint32Array(buffer);

      const videoMediaStreamTrack = zenRTCPeer.captureCanvas(canvas);

      // Set canvas video MediaStreamTrack as state
      setVideoMediaStreamTrack(videoMediaStreamTrack);

      canvasCtx.fillStyle = "black";
      canvasCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    });
  }, [zenRTCPeer]);

  // Handle instantiation of jsnes
  //
  // Note how the ROM is not loaded here, but in a subsequent step
  const nes = useMemo(
    () =>
      new jsnes.NES({
        onFrame: (framebuffer_24) => {
          for (let i = 0; i < CANVAS_FRAMEBUFFER_SIZE; i++) {
            refFrameBufferU32.current[i] = 0xff000000 | framebuffer_24[i];
          }
        },

        onAudioSample: (left, right) => {
          // TODO: Create MediaStreamTrack data from each channel
          // TODO: Remove
          /*
          console.log({
            left,
            right,
          });
          */
        },
      }),
    []
  );

  // Handle keyboard controls broadcast over ZenRTC
  // TODO: Invoke key up on any pressed key, if the corresponding participant disconnects
  useEffect(() => {
    if (!nes || !zenRTCPeer) {
      return;
    }

    const keyboard = (callback, keyCode, player = 1) => {
      switch (keyCode) {
        case 38: // UP
          callback(player, jsnes.Controller.BUTTON_UP);
          break;
        case 40: // Down
          callback(player, jsnes.Controller.BUTTON_DOWN);
          break;
        case 37: // Left
          callback(player, jsnes.Controller.BUTTON_LEFT);
          break;
        case 39: // Right
          callback(player, jsnes.Controller.BUTTON_RIGHT);
          break;
        case 65: // 'a' - qwerty, dvorak
        case 81: // 'q' - azerty
          callback(player, jsnes.Controller.BUTTON_A);
          break;
        case 83: // 's' - qwerty, azerty
        case 79: // 'o' - dvorak
          callback(player, jsnes.Controller.BUTTON_B);
          break;
        case 9: // Tab
          callback(player, jsnes.Controller.BUTTON_SELECT);
          break;
        case 13: // Return
          callback(player, jsnes.Controller.BUTTON_START);
          break;
        default:
          break;
      }
    };

    const handleKeyDown = (keyCode, playerNumber) => {
      keyboard(nes.buttonDown, keyCode, playerNumber);
    };

    const handleKeyUp = (keyCode, playerNumber) => {
      keyCode = 0 - keyCode;

      keyboard(nes.buttonUp, keyCode, playerNumber);
    };

    const handleDataReceived = (data) => {
      const { p: playerNumber, c: keyCode } = data || {};

      if (typeof keyCode === "number") {
        if (keyCode > 0) {
          handleKeyDown(keyCode, playerNumber);
        } else {
          handleKeyUp(keyCode, playerNumber);
        }
      }
    };

    zenRTCPeer.on(EVT_DATA_RECEIVED, handleDataReceived);

    return function unmount() {
      zenRTCPeer.off(EVT_DATA_RECEIVED, handleDataReceived);
    };
  }, [nes, zenRTCPeer]);

  const [romData, setRomData] = useState(undefined);

  // Handle uploading (into RAM) of ROM data
  const handleNESROMUpload = useCallback((evt) => {
    const files = evt.target.files;

    if (!files[0]) {
      return;
    }

    const file = files[0];

    // TODO: Perform file validation here before trying to load into NES

    const reader = new FileReader();
    reader.onload = () => {
      const romData = reader.result;

      // Set ROM data to load into NES
      setRomData(romData);
    };
    reader.readAsBinaryString(file);
  }, []);

  // Handle loading ROM data into NES
  useEffect(() => {
    if (romData) {
      let isMounted = true;

      nes.loadROM(romData);

      const _renderFrames = () => {
        window.requestAnimationFrame(() => {
          if (!isMounted) {
            return;
          }

          nes.frame();

          const image = refImage.current;
          const canvasCtx = refCanvasCtx.current;
          if (image && canvasCtx) {
            image.data.set(refFrameBufferU8.current);
            canvasCtx.putImageData(image, 0, 0);
          }

          _renderFrames();
        });
      };

      _renderFrames();

      return function unmount() {
        isMounted = false;
      };
    }
  }, [romData, nes]);

  // Handle NES streaming through ZenRTC
  useEffect(() => {
    if (isZenRTCConnected && videoMediaStreamTrack) {
      zenRTCPeer.publishMediaStreamTrack(videoMediaStreamTrack);
    }
  }, [isZenRTCConnected, zenRTCPeer, videoMediaStreamTrack]);

  return (
    <div>
      <div>
        <label>Choose NES ROM:</label>
        <input type="file" onChange={handleNESROMUpload} />
      </div>

      <hr />
      <div
        style={{ backgroundColor: "#fff", color: "#000", textAlign: "center" }}
      >
        <div>Renderer</div>
        <canvas width={CANVAS_WIDTH} height={CANVAS_HEIGHT} ref={refCanvas} />
      </div>
    </div>
  );
}
