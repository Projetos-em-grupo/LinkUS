import React from "react";
import { useMensagens } from "./providers/useMensagens";
import { useNavigate } from "react-router-dom";

function ConversasRecentes() {
  const { mensagensUsuario } = useMensagens();
  const navigate = useNavigate();

  return (
    <article aria-labelledby="conversas" className="bg-white rounded-xl shadow-lg p-6 mt-6">
      <h2 id="conversas" className="font-lato font-semibold text-xl text-neutral-800 mb-4">Conversas recentes</h2>
      <ul className="space-y-2">
        {mensagensUsuario &&
          mensagensUsuario.map((mensagem, index) =>
            index < 8 ? (
              <li
                key={mensagem.id_mensagem}
                className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 cursor-pointer hover:bg-primary-50 hover:border-primary-200 transition-all duration-200 border border-transparent hover:border-primary-200"
                onClick={() => {
                  navigate("/mensagem", { state: mensagem });
                }}
              >
                <img
                  id="foto-perfil"
                  src={
                    mensagem.url_foto ? mensagem.url_foto : "./icons/padrao.svg"
                  }
                  alt="Foto de perfil"
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-primary-100"
                />
                <p className="font-lato font-medium text-base text-neutral-700 truncate">{mensagem.nome}</p>
              </li>
            ) : null
          )}
      </ul>
    </article>
  );
}

export default ConversasRecentes;
