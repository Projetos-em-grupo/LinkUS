import { useContext, createContext } from "react";

export const MensagensContext = createContext();

export function useMensagens() {
  return useContext(MensagensContext);
}
