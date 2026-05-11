import React, { useState } from "react";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import AmigosUsuario from "./AmigosUsuario.jsx";
import Solicitacoes from "./Solicitacoes.jsx";

function Amigos() {
  const [termo, setTermo] = useState(null);
  const [conversa, setConversa] = useState(null);

  return (
    <article aria-label="Amigos" className="min-h-screen bg-neutral-50">
      <Header tipo="logado" setTermo={setTermo} />
      <div className="grid grid-cols-3 gap-6 px-15 py-6">
        <Sidebar ativo={"amigos"} />
        <AmigosUsuario termo={termo} setConversa={setConversa} />
        <Solicitacoes conversa={conversa} />
      </div>
    </article>
  );
}

export default Amigos;
