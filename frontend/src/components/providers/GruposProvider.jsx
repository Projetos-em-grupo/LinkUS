import React, { useEffect, useState } from "react";
import { GruposContext } from "./useGrupos";
import { useAutenticador } from "./useAutenticador";

export function GruposProvider({ children }) {
  const { token } = useAutenticador();
  const [gruposLoading, setGruposLoading] = useState(true);
  const [grupos, setGrupos] = useState(null);
  const [gruposUsuarioLoading, setGruposUsuarioLoading] = useState(true);
  const [gruposUsuario, setGruposUsuario] = useState(null);

  async function acharGruposPorUsuario(nome) {
    setGruposUsuarioLoading(true);
    try {
      const result = await fetch(
        `https://link-us-virid.vercel.app/_/backend/grupo/acharGrupos/${nome}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (result.status !== 200)
        console.log("Erro de requisição: " + (await result.text()));
      else setGruposUsuario(await result.json());
    } catch (error) {
      console.error("Erro de requisição" + error);
    } finally {
      setGruposUsuarioLoading(false);
    }
  }

  useEffect(() => {
    async function acharGrupos() {
      try {
        const res = await fetch("https://link-us-virid.vercel.app/_/backend/grupo/acharGrupos", {
          method: "GET",
        });

        if (res.status !== 200)
          console.log("Erro de requisição: " + (await res.text()));
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
