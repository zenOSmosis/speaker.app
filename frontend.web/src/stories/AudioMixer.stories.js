import React from "react";
import FullViewport from "@components/FullViewport";
import AudioMixer from "@components/AudioMixer";

const def = {
  title: "AudioMixer",
  component: AudioMixer,
};

export default def;

const Template = (args) => (
  <FullViewport>
    <AudioMixer {...args} />
  </FullViewport>
);

export const Default = Template.bind({});
Default.args = {
  // percent: 30,
};
