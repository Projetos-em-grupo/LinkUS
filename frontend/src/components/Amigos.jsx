import React, { useState } from "react";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import AmigosUsuario from "./AmigosUsuario.jsx";
import Solicitacoes from "./Solicitacoes.jsx";

function Amigos() {
  const [termo, setTermo] = useState(null);
  const [conversa, setConversa] = useState(null);

  return (
    <article aria-label="Amigos" className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100">
      <Header tipo="logado" setTermo={setTermo} />
      <div className="w-full px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Sidebar ativo={"amigos"} />
          </div>
          <div className="md:col-span-1">
            <AmigosUsuario termo={termo} setConversa={setConversa} />
          </div>
          <div className="md:col-span-1">
            <Solicitacoes conversa={conversa} />
          </div>
        </div>
      </div>
    </article>
  );
}

export default Amigos;
