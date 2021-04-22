import React from "react";
import FullViewport from "@components/FullViewport";
import AudioLevelMeter from "@components/AudioLevelMeter";

const def = {
  title: "AudioLevelMeter",
  component: AudioLevelMeter,
};

export default def;

const Template = (args) => (
  <FullViewport>
    <AudioLevelMeter {...args} />
  </FullViewport>
);

export const SingleLevel = Template.bind({});
SingleLevel.args = {
  percent: 30,
};

export const MultiLevel = Template.bind({});
MultiLevel.args = {
  percents: [28, 80, 32, 54],
};
