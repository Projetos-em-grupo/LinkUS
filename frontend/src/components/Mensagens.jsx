import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import MensagensUsuario from "./MensagensUsuario.jsx";
import Conversas from "./Conversas.jsx";
import { useAutenticador } from "./providers/useAutenticador.jsx";
import GrupoInfo from "./GrupoInfo.jsx";

function Mensagens() {
  const redirec = useLocation().state;
  const navigate = useNavigate();
  const [modal, setModal] = useState();
  const { token } = useAutenticador();
  const [termo, setTermo] = useState(null);
  const [conversa, setConversa] = useState(null);
  useEffect(() => {
    if (!token) {
      navigate("/entrar");
      return null;
    }
  }, [token, navigate]);

  return (
    <article aria-label="Mensagens" className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <Header tipo="logado" setTermo={setTermo} />
      <div className="w-full px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Sidebar ativo={"mensagem"} />
          </div>
          <div className="md:col-span-1">
            <MensagensUsuario
              termo={termo}
              conversa={conversa}
              setConversa={setConversa}
              setModal={setModal}
              redirec={redirec}
            />
          </div>
          <div className="md:col-span-1">
            {modal ? (
              <GrupoInfo grupo={modal} />
            ) : (
              <Conversas
                conversa={conversa}
                setConversa={setConversa}
                setModal={setModal}
              />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default Mensagens;
