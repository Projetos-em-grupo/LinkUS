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
    <article
      aria-label="postagens"
      id="postagens-article"
      className="flex h-screen flex-col overflow-hidden bg-linear-to-br from-neutral-50 to-neutral-100"
    >
      <Header tipo="logado" setTermo={setTermo} />
      <div className="min-h-0 flex-1 w-full px-4 py-6">
        <div className="grid h-full min-h-0 grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <Sidebar />
          </div>
          <div className="min-h-0 md:col-span-1">
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
