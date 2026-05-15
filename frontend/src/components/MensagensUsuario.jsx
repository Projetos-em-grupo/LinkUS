import React, { useEffect } from "react";
import { useMensagens } from "./providers/useMensagens";
import { useAutenticador } from "./providers/useAutenticador";
import "../css/mensagensUsuario.css";
import Loading from "./Loading";

function MensagensUsuario({ conversa, setConversa, setModal, redirec }) {
  const { usuario } = useAutenticador();
  const { acharMensagensPorUsuario, mensagensUsuario, mensagensUsuarioLoading } = useMensagens();

  useEffect(() => {
    if (usuario) acharMensagensPorUsuario(usuario.email);
  }, [usuario, acharMensagensPorUsuario]);

  const normalizeConversa = (item) => {
    if (!item) return null;

    const existing = mensagensUsuario?.find(
      (mensagem) => mensagem.nome === item.nome
    );

    if (existing) return existing;

    const tipo =
      item.tipo ||
      (item.descricao || item.data_criacao || item.id_grupo ? "grupo" : "privada");

    return { ...item, tipo };
  };

  useEffect(() => {
    if (redirec && (!conversa || conversa.nome !== redirec.nome)) {
      const conversaRedirec = normalizeConversa(redirec);
      if (conversaRedirec) {
        setConversa(conversaRedirec);
        setModal(null);
      }
    }
  }, [redirec, conversa, mensagensUsuario, setConversa, setModal]);

  const mensagensVisiveis = mensagensUsuario?.filter(
    (mensagem) => !conversa || mensagem.nome !== conversa.nome
  );
  const semMensagens = !mensagensUsuarioLoading && !mensagensUsuario?.length;

  if (mensagensUsuarioLoading) return <Loading />;

  return (
    <div id="mensagens-usuario">
      <ul>
        {conversa && (
          <li id="conversa-atual">
            <img
              src={conversa.url_midia || "./icons/padrao.svg"}
              alt="Imagem da conversa"
            />
            <div>
              <p>@{conversa.nome}</p>
              <p>{conversa.texto}</p>
            </div>
          </li>
        )}

        {mensagensVisiveis?.map((mensagem) => (
          <li
            key={mensagem.nome}
            style={{ cursor: "pointer" }}
            onClick={() => {
              setConversa(mensagem);
              setModal(null);
            }}
          >
            <img
              src={mensagem.url_midia || "./icons/padrao.svg"}
              alt="Imagem da conversa"
            />
            <div>
              <p>@{mensagem.nome}</p>
              <p>{mensagem.texto}</p>
            </div>
          </li>
        ))}

        {semMensagens && !conversa && (
          <li className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 text-neutral-500">
            <img src="./icons/mensagem.svg" alt="Sem mensagens" className="w-10 h-10" />
            <p className="font-poppins font-semibold text-neutral-700">Nenhuma mensagem encontrada</p>
            <p className="text-sm text-center text-neutral-500">Inicie uma nova conversa para começar a trocar mensagens.</p>
          </li>
        )}

        {conversa && mensagensVisiveis?.length === 0 && (
          <li className="flex items-center gap-2 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">
            <img src="./icons/mensagem.svg" alt="Nenhuma conversa" className="w-5 h-5" />
            <span>Sem outras conversas recentes.</span>
          </li>
        )}
      </ul>
    </div>
  );
}

export default MensagensUsuario;
