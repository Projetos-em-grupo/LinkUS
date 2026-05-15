import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import PostagensOutroUsuario from "./PostagensOutroUsuario";
import ConversasRecentes from "./ConversasRecentes";

function OutroUsuario() {
  const [termo, setTermo] = useState();
  const outroUsuario = useLocation().state;

  return (
    <article aria-label="postagens" id="postagens-article">
      <Header tipo="logado" setTermo={setTermo} />
      <div>
        <Sidebar />
        <PostagensOutroUsuario outroUsuario={outroUsuario} termo={termo} />
        <ConversasRecentes />
      </div>
    </article>
  );
}

export default OutroUsuario;
