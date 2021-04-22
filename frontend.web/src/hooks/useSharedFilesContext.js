import { useContext } from "react";
import { SharedFilesContext } from "@providers/SharedFilesProvider";

export default function useSharedFilesContext() {
  return useContext(SharedFilesContext);
}
