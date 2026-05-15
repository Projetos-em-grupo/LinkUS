import { useContext, createContext } from "react";

export const AutenticadorContext = createContext();

export function useAutenticador() {
  return useContext(AutenticadorContext);
}
