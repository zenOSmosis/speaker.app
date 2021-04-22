import React from "react";
import FullViewport from "@components/FullViewport";
import AutoScaler from "@components/AutoScaler";

const def = {
  title: "AutoScaler",
  component: AutoScaler,
};

export default def;

const Template = (args) => (
  <FullViewport>
    <div style={{ width: "100%", height: 480, border: "1px #ccc solid" }}>
      <AutoScaler>
        <div style={{ width: 320, height: 240, backgroundColor: "yellow" }}>
          scaled content
        </div>
      </AutoScaler>
    </div>
  </FullViewport>
);

export const Default = Template.bind({});
Default.args = {};
