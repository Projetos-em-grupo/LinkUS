import { useContext, createContext } from "react";

export const UsuariosContext = createContext();

export function useUsuarios() {
  return useContext(UsuariosContext);
}
