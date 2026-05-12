import React, { useState, useCallback } from "react";
import { MensagensContext } from "./useMensagens";
import { useAutenticador } from "./useAutenticador";

export function MensagensProvider({ children }) {
  const { token } = useAutenticador();
  const [mensagensLoading, setMensagensLoading] = useState(true);
  const [mensagensUsuarioLoading, setMensagensUsuarioLoading] = useState(true);
  const [mensagensUsuario, setMensagensUsuario] = useState(null);

  const acharMensagensPorUsuario = useCallback(async (email) => {
    setMensagensUsuarioLoading(true);
    try {
      const result = await fetch(
        `https://link-us-virid.vercel.app/_/backend/mensagem/listarConversasUsuario/${email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (result.status !== 200)
        console.log("Erro de requisição: " + (await result.text()));
      else {
        const json = await result.json();
        console.log(json);
        setMensagensUsuario(json);
      }
    } catch (error) {
      console.error("Erro de requisição" + error);
    } finally {
      setMensagensUsuarioLoading(false);
    }
  }, [token]);

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
