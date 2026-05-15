import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import PostagensUsuario from "./PostagensUsuario.jsx";
import ConversasRecentes from "./ConversasRecentes.jsx";
import { useAutenticador } from "./providers/useAutenticador.jsx";

function Perfil() {
  const navigate = useNavigate();
  const { token } = useAutenticador();
  const [termo, setTermo] = useState(null);
  useEffect(() => {
    if (!token) {
      navigate("/entrar");
      return null;
    }
  }, [token, navigate]);

  return (
    <article aria-label="Perfil">
      <Header tipo="logado" setTermo={setTermo} />
      <div>
        <Sidebar />
        <PostagensUsuario termo={termo} />
        <ConversasRecentes />
      </div>
    </article>
  );
}

export default Perfil;
