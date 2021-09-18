import React from "react";
import LabeledSwitch from "@components/LabeledSwitch";

const def = {
  title: "LabeledSwitch",
  component: LabeledSwitch,
  /*
  argTypes: {
    onChange: {
      action: "onChange",
    },
  },
  */
};

export default def;

const Template = (args) => <LabeledSwitch {...args} />;

export const Labels = Template.bind({});
Labels.args = {
  isOn: false,
  labelOff: "labelOff",
  labelOn: "labelOn",
  masterLabel: "LabeledSwitch",
  disabled: false,
  onChange: (isOn) => alert(`onChange(${isOn})`), // TODO: Use storybook actions
};
