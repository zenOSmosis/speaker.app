import path from "path";
import fs from "fs";
import sdpTransform from "sdp-transform";

import SDPAdapter from "./SDPAdapter";

const MOCK_BASE_PATH = path.resolve(__dirname, "mock-data");

describe("SDPAdapter", () => {
  it("Sets preferred offer codec to OPUS only", () => {
    const offerPath = path.resolve(
      MOCK_BASE_PATH,
      "chrome.89.sdp.offer.original.txt"
    );
    const offer = fs.readFileSync(offerPath).toString();

    const modifiedOfferPath = path.resolve(
      MOCK_BASE_PATH,
      "chrome.89.sdp.offer.opus-only.txt"
    );
    const modifiedOffer = fs.readFileSync(modifiedOfferPath).toString();

    expect(offer).not.toEqual(modifiedOffer);

    expect(
      sdpTransform.parse(SDPAdapter.setPreferredAudioCodecs(offer, ["opus"]))
    ).toEqual(sdpTransform.parse(modifiedOffer));
  });
});
