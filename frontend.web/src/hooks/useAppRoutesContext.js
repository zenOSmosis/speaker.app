import { useContext } from "react";
import { AppRoutesContext } from "@providers/AppRoutesProvider";

export default function useAppRoutesContext() {
  return useContext(AppRoutesContext);
}
