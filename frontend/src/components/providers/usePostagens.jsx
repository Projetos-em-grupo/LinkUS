import { useContext, createContext } from "react";

export const PostagensContext = createContext();

export function usePostagens() {
  return useContext(PostagensContext);
}
