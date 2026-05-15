import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAutenticador } from "./providers/useAutenticador";
import { useGrupos } from "./providers/useGrupos";
import { useMensagens } from "./providers/useMensagens";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Postagens from "./Postagens";
import ConversasRecentes from "./ConversasRecentes";

function Post() {
  const navigate = useNavigate();
  const { acharGruposPorUsuario } = useGrupos();
  const { acharMensagensPorUsuario } = useMensagens();
  const { usuario, token } = useAutenticador();
  const [termo, setTermo] = useState(null);
  const [acharUsuarioInfo, setAcharUsuarioInfo] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  useEffect(() => {
    if (usuario?.nome && acharUsuarioInfo) {
      acharGruposPorUsuario(usuario.nome);
      acharMensagensPorUsuario(usuario.email);
      setAcharUsuarioInfo(false);
    }
  }, [usuario, acharUsuarioInfo, acharGruposPorUsuario, acharMensagensPorUsuario]);

  return (
    <article
      aria-label="postagens"
      className="flex h-screen flex-col overflow-hidden bg-linear-to-br from-neutral-50 to-neutral-100"
    >
      <Header tipo="logado" setTermo={setTermo} />
      <div className="min-h-0 flex-1 w-full px-4 py-6">
        <div className="grid h-full min-h-0 grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <Sidebar ativo="home" />
          </div>
          <div className="min-h-0 md:col-span-1">
            <Postagens termo={termo} />
          </div>
          <div className="md:col-span-1">
            <ConversasRecentes />
          </div>
        </div>
      </div>
    </article>
  );
}

export default Post;
