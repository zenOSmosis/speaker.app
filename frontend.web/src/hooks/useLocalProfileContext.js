import { useContext } from "react";
import { LocalProfileContext } from "@providers/LocalProfileProvider";

export default function useLocalProfileContext() {
  return useContext(LocalProfileContext);
}
