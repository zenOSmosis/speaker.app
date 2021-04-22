import React from "react";
import AppLayout from "./../components/AppLayout";
import "../style.js";

export default {
  title: "AppLayout",
  component: AppLayout,
};

const Template = (args) => <AppLayout {...args} />;

export const SidebarActive = Template.bind({});
SidebarActive.args = {
  realmId: "storybook-realm-id",
  channelId: "storybook-channel-id",
  userId: "storybook-user-id",
  zenRTCPeer: {
    getIsMuted: () => null,
    getIsScreenSharingSupported: () => true,
    addCapability: () => null,
    toggleMute: () => null,
    disconnect: () => null,
    emitSyncEvent: () => null,
  },
  isSocketIoConnected: true,
  isZenRTCConnecting: false,
  isZenRTCConnected: true,
};
