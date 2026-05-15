import React, { useEffect, useState, useRef } from "react";
import { UsuariosContext } from "./useUsuarios";

export function UsuariosProvider({ children }) {
  const [usuariosLoading, setUsuariosLoading] = useState(true);
  const [usuariosTrigger, setUsuariosTrigger] = useState(true);
  const [usuarios, setUsuarios] = useState(null);
  const usuariosCacheRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    async function acharUsuarios() {
      if (usuariosCacheRef.current && usuariosTrigger !== true) {
        setUsuarios(usuariosCacheRef.current);
        setUsuariosLoading(false);
        return;
      }

      setUsuariosLoading(true);

      try {
        const res = await fetch(
          "https://link-us-virid.vercel.app/_/backend/usuario/acharUsuarios",
          {
            method: "GET",
            signal: controller.signal,
          }
        );

        if (res.status !== 200) {
          console.log("Erro de requisicao: " + (await res.text()));
          return;
        }

        const json = await res.json();
        usuariosCacheRef.current = json;
        setUsuarios(json);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Erro ao carregar os usuarios" + error);
        }
      } finally {
        setUsuariosLoading(false);
      }
    }

    acharUsuarios();

    return () => controller.abort();
  }, [usuariosTrigger]);

  return (
    <UsuariosContext.Provider
      value={{
        usuariosLoading,
        setUsuariosLoading,
        usuarios,
        usuariosTrigger,
        setUsuariosTrigger,
      }}
    >
      {children}
    </UsuariosContext.Provider>
  );
}
