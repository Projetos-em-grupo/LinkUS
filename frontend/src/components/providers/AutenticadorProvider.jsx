import React from "react";
import { useState, useEffect } from "react";
import { AutenticadorContext } from "./useAutenticador";
import { jwtDecode } from "jwt-decode";

export function AutenticadorProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [usuario, setUsuario] = useState(null);
  const [tokenNovo, setTokenNovo] = useState();

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp > Date.now() / 1000) setUsuario(decoded);
        else logout();
      } catch (e) {
        console.error("Token inválido:", e);
        logout();
      }
    }
  }, [token]);

  useEffect(() => {
    if (tokenNovo?.token) {
      localStorage.removeItem("token");
      localStorage.setItem("token", tokenNovo.token);
      setToken(tokenNovo.token);
      setUsuario(jwtDecode(tokenNovo.token));
    }
  }, [tokenNovo]);

  async function login(email, senha) {
    const result = await fetch("https://link-us-virid.vercel.app/_/backend/usuario/logarUsuario", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (result.ok) {
      const data = await result.json();
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUsuario(jwtDecode(data.token));
      return { success: true, status: result.status };
    } else {
      const message = await result.text();
      console.error("Erro ao logar o usuário: " + message);
      return { success: false, status: result.status, message };
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUsuario(null);
  }

  return (
    <AutenticadorContext.Provider
      value={{ token, login, logout, usuario, setTokenNovo }}
    >
      {children}
    </AutenticadorContext.Provider>
  );
}
