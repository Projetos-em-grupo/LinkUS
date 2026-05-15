import React, { useEffect, useState } from "react";
import { useMensagens } from "./providers/useMensagens";
import { useAutenticador } from "./providers/useAutenticador";
import "../css/mensagensUsuario.css";

function MensagensUsuario({ conversa, setConversa, setModal, redirec }) {
  const { usuario } = useAutenticador();
  const { acharMensagensPorUsuario, mensagensUsuario } = useMensagens();

  const [mensagensFiltradas, setMensagensFiltradas] = useState(null);

  useEffect(() => {
    if (mensagensUsuario) setMensagensFiltradas(mensagensUsuario);
  }, [mensagensUsuario]);

  useEffect(() => {
    if (usuario) acharMensagensPorUsuario(usuario.email);
  }, [usuario]);

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
        {mensagensFiltradas &&
          mensagensFiltradas.map((mensagem) => {
            if (mensagem.nome === redirec?.nome && !conversa) {
              setMensagensFiltradas(
                mensagensUsuario.filter((men) => {
                  return men.nome !== mensagem.nome;
                })
              );
              setConversa(mensagem);
            }
            return (
              <li
                key={mensagem.nome}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setMensagensFiltradas(
                    mensagensUsuario.filter((men) => {
                      return men.nome !== mensagem.nome;
                    })
                  );
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
            );
          })}
      </ul>
    </div>
  );
}

export default MensagensUsuario;
