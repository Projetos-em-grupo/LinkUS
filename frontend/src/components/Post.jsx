import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAutenticador } from "./providers/useAutenticador";
import { useGrupos } from "./providers/useGrupos";
import { useMensagens } from "./providers/useMensagens";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Postagens from "./Postagens";
import ConversasRecentes from "./ConversasRecentes";
import "../css/post.css";

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
    <article aria-label="postagens" id="postagens-article">
      <Header tipo="logado" setTermo={setTermo} />
      <div>
        <Sidebar ativo="home" />
        <Postagens termo={termo} />
        <ConversasRecentes />
      </div>
    </article>
  );
}

export default Post;
