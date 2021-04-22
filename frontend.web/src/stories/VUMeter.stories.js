import React from "react";
import FullViewport from "@components/FullViewport";
import VUMeter from "@components/VUMeter";

const def = {
  title: "VUMeter",
  component: VUMeter,
};

export default def;

const Template = (args) => (
  <FullViewport>
    <VUMeter {...args} />
  </FullViewport>
);

export const Default = Template.bind({});
Default.args = {
  label: "Channel",
  percent: 30,
};
