import { useContext } from "react";
import { NotificationsContext } from "@providers/NotificationsProvider";

export default function useAppLayoutContext() {
  return useContext(NotificationsContext);
}
