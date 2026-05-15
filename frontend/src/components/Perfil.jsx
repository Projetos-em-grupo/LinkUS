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
    <article aria-label="Perfil" className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100">
      <Header tipo="logado" setTermo={setTermo} />
      <div className="w-full px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Sidebar />
          </div>
          <div className="md:col-span-1">
            <PostagensUsuario termo={termo} />
          </div>
          <div className="md:col-span-1">
            <ConversasRecentes />
          </div>
        </div>
      </div>
    </article>
  );
}

export default Perfil;
