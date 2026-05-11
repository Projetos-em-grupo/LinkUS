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
    <article aria-label="postagens" id="postagens-article" className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100">
      <Header tipo="logado" setTermo={setTermo} />
      <div className="w-full px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Sidebar />
          </div>
          <div className="md:col-span-1">
            <PostagensOutroUsuario outroUsuario={outroUsuario} termo={termo} />
          </div>
          <div className="md:col-span-1">
            <ConversasRecentes />
          </div>
        </div>
      </div>
    </article>
  );
}

export default OutroUsuario;
