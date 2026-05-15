import { useContext, createContext } from "react";

export const GruposContext = createContext();

export function useGrupos() {
  return useContext(GruposContext);
}
