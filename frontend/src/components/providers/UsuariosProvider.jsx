import React, { useEffect, useState } from "react";
import { UsuariosContext } from "./useUsuarios";

export function UsuariosProvider({ children }) {
  const [usuariosLoading, setUsuariosLoading] = useState(true);
  const [usuariosTrigger, setUsuariosTrigger] = useState(true);
  const [usuarios, setUsuarios] = useState(null);

  useEffect(() => {
    async function acharUsuarios() {
      try {
        const res = await fetch("https://link-us-virid.vercel.app/_/backend/usuario/acharUsuarios", {
          method: "GET",
        });

        if (res.status !== 200)
          console.log("Erro de requisição: " + (await res.text()));
        else setUsuarios(await res.json());
      } catch (error) {
        console.error("Erro ao carregar os usuários" + error);
      } finally {
        setUsuariosLoading(false);
      }
    }

    acharUsuarios();
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
