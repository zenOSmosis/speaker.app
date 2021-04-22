import React, { useMemo } from "react";
import sdpTransform from "sdp-transform";

export default function SDPMedia({ sdp }) {
  const parsedSDP = useMemo(() => sdp && sdpTransform.parse(sdp), [sdp]);

  if (!parsedSDP) {
    return "N/A";
  }

  return (
    parsedSDP &&
    parsedSDP.media &&
    parsedSDP.media
      .sort((a, b) => (a.type > b.type ? 1 : -1))
      .map((media, idx) => {
        return (
          <div key={idx} style={{ padding: 4 }}>
            <div>Type: {media.type}</div>
            {media.type !== "application" && (
              <React.Fragment>
                <div>Direction: {media.direction}</div>
                <div>MSID: {media.msid || "N/A"}</div>
                <div>MID: {media.mid}</div>
                <div>
                  <table style={{ width: "100%" }}>
                    <thead>
                      <tr>
                        <td style={{ width: "50%" }}>Codec</td>
                        <td style={{ width: "50%" }}>Rate</td>
                      </tr>
                    </thead>
                    <tbody>
                      {media.rtp &&
                        media.rtp.map((rtp, idx) => {
                          return (
                            <tr key={idx}>
                              <td>{rtp.codec}</td>
                              <td>{rtp.rate}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </React.Fragment>
            )}
          </div>
        );
      })
  );
}
