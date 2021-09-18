import { useContext } from "react";
import { ChatMessagesContext } from "@providers/ChatMessagesProvider";

export default function useChatMessagesContext() {
  return useContext(ChatMessagesContext);
}
