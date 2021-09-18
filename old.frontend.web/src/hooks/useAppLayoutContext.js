import { useContext } from "react";
import { AppLayoutContext } from "@providers/AppLayoutProvider";

export default function useAppLayoutContext() {
  return useContext(AppLayoutContext);
}
