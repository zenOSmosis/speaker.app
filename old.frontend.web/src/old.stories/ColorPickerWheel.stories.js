import React from "react";
import FullViewport from "@components/FullViewport";
import ColorPickerWheel from "@components/ColorPickerWheel";

const def = {
  title: "ColorPickerWheel",
  component: ColorPickerWheel,
};

export default def;

const Template = (args) => (
  <FullViewport>
    <ColorPickerWheel {...args} />
  </FullViewport>
);

export const Default = Template.bind({});
Default.args = {};
