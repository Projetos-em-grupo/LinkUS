import React, { useState, useCallback, useRef } from "react";
import { MensagensContext } from "./useMensagens";
import { useAutenticador } from "./useAutenticador";

export function MensagensProvider({ children }) {
  const { token } = useAutenticador();
  const [mensagensLoading, setMensagensLoading] = useState(true);
  const [mensagensUsuarioLoading, setMensagensUsuarioLoading] = useState(true);
  const [mensagensUsuario, setMensagensUsuario] = useState(null);
  const mensagensCacheRef = useRef(new Map());
  const mensagensPromiseRef = useRef(new Map());

  const acharMensagensPorUsuario = useCallback(
    async (email, options = {}) => {
      const { force = false } = options;

      if (!email) return [];

      if (!force && mensagensCacheRef.current.has(email)) {
        const cached = mensagensCacheRef.current.get(email);
        setMensagensUsuario(cached);
        setMensagensUsuarioLoading(false);
        return cached;
      }

      if (!force && mensagensPromiseRef.current.has(email)) {
        setMensagensUsuarioLoading(true);
        const pending = await mensagensPromiseRef.current.get(email);
        setMensagensUsuario(pending);
        setMensagensUsuarioLoading(false);
        return pending;
      }

      setMensagensUsuarioLoading(true);

      const request = (async () => {
        try {
          const result = await fetch(
            `https://link-us-virid.vercel.app/_/backend/mensagem/listarConversasUsuario/${email}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (result.status !== 200) {
            console.log("Erro de requisicao: " + (await result.text()));
            return [];
          }

          const json = await result.json();
          mensagensCacheRef.current.set(email, json);
          return json;
        } catch (error) {
          console.error("Erro de requisicao" + error);
          return [];
        } finally {
          mensagensPromiseRef.current.delete(email);
        }
      })();

      mensagensPromiseRef.current.set(email, request);

      const data = await request;
      setMensagensUsuario(data);
      setMensagensUsuarioLoading(false);
      setMensagensLoading(false);
      return data;
    },
    [token]
  );

  return (
    <MensagensContext.Provider
      value={{
        mensagensLoading,
        setMensagensLoading,
        mensagensUsuario,
        mensagensUsuarioLoading,
        acharMensagensPorUsuario,
      }}
    >
      {children}
    </MensagensContext.Provider>
  );
}
