import { useContext, createContext } from "react";

export const ConexaoContext = createContext();

export function useConexao() {
  return useContext(ConexaoContext);
}
