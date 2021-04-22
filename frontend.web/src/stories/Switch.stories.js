import React from "react";
import Switch from "@components/Switch";

const def = {
  title: "Switch",
  component: Switch,
  /*
  argTypes: {
    onChange: {
      action: "onChange",
    },
  },
  */
};

export default def;

const Template = (args) => <Switch {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  isOn: true,
  onChange: (isOn) => alert(`onChange(${isOn})`), // TODO: Use storybook actions
};
