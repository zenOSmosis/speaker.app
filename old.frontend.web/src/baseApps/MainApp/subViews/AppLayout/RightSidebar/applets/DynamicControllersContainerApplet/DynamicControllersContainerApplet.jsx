import React from "react";
// import ScreenShareIcon from "../../../../../icons/ScreenShareIcon";
// import Cover from "../../../../../Cover";

export default function DynamicControllersContainerApplet({ ...rest }) {
  return (
    <div>
      <div>[DynamicControllersContainerApplet]</div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        <li>NES</li>
        <li>Music</li>
        <li>
          <div>TTS</div>
          <div>
            <textarea
              placeholder="Enter text"
              style={{ width: "100%" }}
            ></textarea>
          </div>
        </li>
      </ul>
    </div>
  );
}
