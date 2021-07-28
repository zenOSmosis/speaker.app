import {
  META_CHUNK_KEY_IS_CHUNK,
  META_CHUNK_KEY_SERIAL_TYPE,
  META_CHUNK_KEY_DATA,
  META_CHUNK_KEY_INDEX,
  META_CHUNK_KEY_LEN_CHUNKS,
  META_CHUNK_KEY_BATCH_CODE,
} from "./_ZenRTCPeer.DataChannelChunkBatchCore";
import DataChannelChunkBatchSender from "./ZenRTCPeer.DataChannelChunkBatchSender";
import DataChannelChunkBatchReceiver from "./ZenRTCPeer.DataChannelChunkBatchReceiver";

import { SERIAL_TYPE_STRING } from "../ZenRTCPeer.DataChannelManagerModule";

const LARGE_MOCK_JSON = JSON.stringify({
  a: 123,
  b: "456",
  c: "some-really-long-string".repeat(1000 * 32),
});

describe("unique chunk keys", () => {
  it("expects chunk keys to have unique values", () => {
    const chunkKeys = [
      META_CHUNK_KEY_IS_CHUNK,
      META_CHUNK_KEY_SERIAL_TYPE,
      META_CHUNK_KEY_DATA,
      META_CHUNK_KEY_INDEX,
      META_CHUNK_KEY_LEN_CHUNKS,
      META_CHUNK_KEY_BATCH_CODE,
    ];

    const distinctKeys = [...new Set(chunkKeys)];

    expect(chunkKeys.length).toEqual(distinctKeys.length);
  });
});

describe("determines if data should be chunked", () => {
  it("expects LARGE_MOCK_JSON to be 736026 length", () => {
    expect(LARGE_MOCK_JSON.length).toEqual(736026);
  });

  it("expects short data to not be chunked", () => {
    expect(
      DataChannelChunkBatchSender.getShouldBeChunked("some really short string")
    ).toEqual(false);
  });

  it("expects large data to be chunked", () => {
    expect(
      DataChannelChunkBatchSender.getShouldBeChunked(LARGE_MOCK_JSON)
    ).toEqual(true);
  });
});

describe("data chunking", () => {
  const sender = new DataChannelChunkBatchSender(LARGE_MOCK_JSON);

  it("obtains same number of chunks across multiple chunking operations", () => {
    expect(sender.getTotalChunks()).toEqual(24);

    expect(sender.UNSAFE_getCalculatedTotalChunks()).toEqual(24);

    expect(sender.getChunks().length).toEqual(24);

    expect(sender.getMetaChunks().length).toEqual(24);
  });

  it("reads data chunks", () => {
    const metaChunks = sender.getMetaChunks();

    metaChunks.forEach(metaChunk => {
      expect(DataChannelChunkBatchReceiver.getIsChunked(metaChunk)).toEqual(
        true
      );

      expect(
        typeof DataChannelChunkBatchReceiver.readMetaChunk(metaChunk)
      ).toEqual("object");
    });
  });

  it("reassimilates data chunks", () => {
    // Random ordered chunks
    const metaChunks = sender
      .getMetaChunks()
      .sort((a, b) => 0.5 - Math.random());

    // Ensure chunks are randomized
    const str = metaChunks
      .map(({ [META_CHUNK_KEY_DATA]: data }) => data)
      .join("");
    expect(typeof str).toBe("string");
    expect(str.length).toEqual(LARGE_MOCK_JSON.length);
    expect(str).not.toBe(LARGE_MOCK_JSON);

    let receiver = null;

    metaChunks.forEach((metaChunk, idx) => {
      const newReceiver =
        DataChannelChunkBatchReceiver.importMetaChunk(metaChunk);

      if (receiver) {
        expect(newReceiver).toBe(receiver);
      } else {
        receiver = newReceiver;
      }

      const isComplete = idx === metaChunks.length - 1 ? true : false;

      expect(receiver.getIsComplete()).toBe(isComplete);
    });

    // Receiver's short code should match sender's after meta chunks have been
    // received
    expect(receiver.getBatchCode()).toEqual(sender.getBatchCode());

    expect(receiver.getSerialType()).toEqual(SERIAL_TYPE_STRING);

    expect(receiver.read()).toEqual(LARGE_MOCK_JSON);
  });

  // Test destruct; should come last
  it("sender empties data on destruct", async () => {
    expect(sender._data.length).toBeGreaterThan(0);
    expect(sender._cachedChunks.length).toBeGreaterThan(0);

    await sender.destroy();

    expect(sender._data).toEqual("");
    expect(sender._cachedChunks.length).toEqual(0);
  });
});
