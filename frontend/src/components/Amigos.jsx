import React, { useState } from "react";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import AmigosUsuario from "./AmigosUsuario.jsx";
import Solicitacoes from "./Solicitacoes.jsx";

function Amigos() {
  const [termo, setTermo] = useState(null);
  const [conversa, setConversa] = useState(null);

  return (
    <article aria-label="Amigos">
      <Header tipo="logado" setTermo={setTermo} />
      <div>
        <Sidebar ativo={"amigos"} />
        <AmigosUsuario termo={termo} setConversa={setConversa} />
        <Solicitacoes conversa={conversa} />
      </div>
    </article>
  );
}

export default Amigos;
