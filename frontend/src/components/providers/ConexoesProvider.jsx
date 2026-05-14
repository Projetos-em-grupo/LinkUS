import React, { useState, useCallback, useRef } from "react";
import { ConexaoContext } from "./useConexao";
import { useAutenticador } from "./useAutenticador";

export function ConexoesProvider({ children }) {
  const { token } = useAutenticador();
  const [conexoesUsuarioLoading, setConexoesUsuarioLoading] = useState(true);
  const [conexoesUsuario, setConexoesUsuario] = useState([]);
  const conexoesCacheRef = useRef(new Map());
  const conexoesPromiseRef = useRef(new Map());

  const acharConexoesPorUsuario = useCallback(
    async (nome, options = {}) => {
      const { force = false } = options;

      if (!nome) return [];

      if (!force && conexoesCacheRef.current.has(nome)) {
        const cached = conexoesCacheRef.current.get(nome);
        setConexoesUsuario(cached);
        setConexoesUsuarioLoading(false);
        return cached;
      }

      if (!force && conexoesPromiseRef.current.has(nome)) {
        setConexoesUsuarioLoading(true);
        const pending = await conexoesPromiseRef.current.get(nome);
        setConexoesUsuario(pending);
        setConexoesUsuarioLoading(false);
        return pending;
      }

      setConexoesUsuarioLoading(true);

      const request = (async () => {
        try {
          const result = await fetch(
            `https://link-us-virid.vercel.app/_/backend/conexao/acharConexoes/${nome}`,
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
          conexoesCacheRef.current.set(nome, json);
          return json;
        } catch (error) {
          console.error("Erro de requisicao" + error);
          return [];
        } finally {
          conexoesPromiseRef.current.delete(nome);
        }
      })();

      conexoesPromiseRef.current.set(nome, request);

      const data = await request;
      setConexoesUsuario(data);
      setConexoesUsuarioLoading(false);
      return data;
    },
    [token]
  );

  return (
    <ConexaoContext.Provider
      value={{
        conexoesUsuario,
        conexoesUsuarioLoading,
        acharConexoesPorUsuario,
      }}
    >
      {children}
    </ConexaoContext.Provider>
  );
}
