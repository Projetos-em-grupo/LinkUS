import React, { useEffect, useState, useCallback, useRef } from "react";
import { GruposContext } from "./useGrupos";
import { useAutenticador } from "./useAutenticador";

export function GruposProvider({ children }) {
  const { token } = useAutenticador();
  const [gruposLoading, setGruposLoading] = useState(true);
  const [grupos, setGrupos] = useState(null);
  const [gruposUsuarioLoading, setGruposUsuarioLoading] = useState(true);
  const [gruposUsuario, setGruposUsuario] = useState(null);
  const gruposUsuarioCacheRef = useRef(new Map());
  const gruposUsuarioPromiseRef = useRef(new Map());

  const acharGruposPorUsuario = useCallback(
    async (nome, options = {}) => {
      const { force = false } = options;

      if (!nome) return [];

      if (!force && gruposUsuarioCacheRef.current.has(nome)) {
        const cached = gruposUsuarioCacheRef.current.get(nome);
        setGruposUsuario(cached);
        setGruposUsuarioLoading(false);
        return cached;
      }

      if (!force && gruposUsuarioPromiseRef.current.has(nome)) {
        setGruposUsuarioLoading(true);
        const pending = await gruposUsuarioPromiseRef.current.get(nome);
        setGruposUsuario(pending);
        setGruposUsuarioLoading(false);
        return pending;
      }

      setGruposUsuarioLoading(true);

      const request = (async () => {
        try {
          const result = await fetch(
            `https://link-us-virid.vercel.app/_/backend/grupo/acharGrupos/${nome}`,
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
          gruposUsuarioCacheRef.current.set(nome, json);
          return json;
        } catch (error) {
          console.error("Erro de requisicao" + error);
          return [];
        } finally {
          gruposUsuarioPromiseRef.current.delete(nome);
        }
      })();

      gruposUsuarioPromiseRef.current.set(nome, request);

      const data = await request;
      setGruposUsuario(data);
      setGruposUsuarioLoading(false);
      return data;
    },
    [token]
  );

  useEffect(() => {
    async function acharGrupos() {
      try {
        const res = await fetch("https://link-us-virid.vercel.app/_/backend/grupo/acharGrupos", {
          method: "GET",
        });

        if (res.status !== 200)
          console.log("Erro de requisicao: " + (await res.text()));
        else setGrupos(await res.json());
      } catch (error) {
        console.error("Erro ao carregar os grupos" + error);
      } finally {
        setGruposLoading(false);
      }
    }

    acharGrupos();
  }, []);

  return (
    <GruposContext.Provider
      value={{
        gruposLoading,
        setGruposLoading,
        grupos,
        gruposUsuario,
        gruposUsuarioLoading,
        acharGruposPorUsuario,
      }}
    >
      {children}
    </GruposContext.Provider>
  );
}
