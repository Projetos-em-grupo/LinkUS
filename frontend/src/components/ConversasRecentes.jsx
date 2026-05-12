import React from "react";
import { useMensagens } from "./providers/useMensagens";
import { useNavigate } from "react-router-dom";

function ConversasRecentes() {
  const { mensagensUsuario, mensagensUsuarioLoading } = useMensagens();
  const navigate = useNavigate();

  const hasConversas = mensagensUsuario && mensagensUsuario.length > 0;

  return (
    <article aria-labelledby="conversas" className="bg-white rounded-xl shadow-lg p-6 mt-6">
      <h2 id="conversas" className="font-lato font-semibold text-xl text-neutral-800 mb-4">Conversas recentes</h2>
      <ul className="space-y-2">
        {hasConversas ? (
          mensagensUsuario.map((mensagem, index) =>
            index < 8 ? (
              <li
                key={mensagem.id_mensagem}
                className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 cursor-pointer hover:bg-cyan-50 hover:border-cyan-200 transition-all duration-200 border border-transparent"
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
                  className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-neutral-800"
                />
                <p className="font-lato font-medium text-base text-neutral-700 truncate">{mensagem.nome}</p>
              </li>
            ) : null
          )
        ) : (
          <li className="flex flex-col items-center gap-3 p-6 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 text-neutral-500">
            <img src="./icons/mensagem.svg" alt="Nenhuma conversa" className="w-10 h-10" />
            <p className="font-lato font-semibold text-neutral-700">Nenhuma conversa recente</p>
            <p className="text-sm text-neutral-500 text-center">Comece a conversar para ver as interações aparecerem aqui.</p>
          </li>
        )}
      </ul>
    </article>
  );
}

export default ConversasRecentes;
