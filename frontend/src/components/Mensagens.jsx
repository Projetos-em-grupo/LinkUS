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
    <article aria-label="Mensagens">
      <Header tipo="logado" setTermo={setTermo} />
      <div>
        <Sidebar ativo={"mensagem"} />
        <MensagensUsuario
          termo={termo}
          conversa={conversa}
          setConversa={setConversa}
          setModal={setModal}
          redirec={redirec}
        />
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
    </article>
  );
}

export default Mensagens;
