import React from "react";
import FullViewport from "./../components/FullViewport";
import AudioLoopCreator from "./../components/AudioLoopCreator";

const def = {
  title: "AudioLoopCreator",
  component: AudioLoopCreator,
};

export default def;

const Template = (args) => (
  <FullViewport>
    <AudioLoopCreator {...args} />
  </FullViewport>
);

export const Proto = Template.bind({});
Proto.args = {
  // TODO: Convert to action
  onPlayNote: (...args) => console.debug({ ...args }),
};
