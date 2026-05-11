import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAutenticador } from "./providers/useAutenticador";
import { useGrupos } from "./providers/useGrupos";
import { useMensagens } from "./providers/useMensagens";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Postagens from "./Postagens";
import ConversasRecentes from "./ConversasRecentes";

function Post() {
  const navigate = useNavigate();
  const dados = useLocation().state;
  const { acharGruposPorUsuario } = useGrupos();
  const { acharMensagensPorUsuario } = useMensagens();
  const { login, usuario, token } = useAutenticador();
  const [termo, setTermo] = useState(null);
  const [acharUsuarioInfo, setAcharUsuarioInfo] = useState(true);
  const [jaTentouLogar, setJaTentouLogar] = useState(false);

  useEffect(() => {
    async function logar() {
      if (usuario || token || jaTentouLogar) return;
      try {
        if (!(await login(dados.email, dados.senha))) navigate("/");
      } catch {
        navigate("/");
      } finally {
        setJaTentouLogar(true);
      }
    }

    logar();
  }, [token, usuario, dados, navigate, jaTentouLogar]);

  useEffect(() => {
    if (usuario?.nome && acharUsuarioInfo) {
      acharGruposPorUsuario(usuario.nome);
      acharMensagensPorUsuario(usuario.email);
      setAcharUsuarioInfo(false);
    }
  }, [usuario, acharUsuarioInfo]);

  return (
    <article aria-label="postagens" className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100">
      <Header tipo="logado" setTermo={setTermo} />
      <div className="w-full px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Sidebar ativo="home" />
          </div>
          <div className="md:col-span-1">
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
