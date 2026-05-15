import React from "react";
import { useMensagens } from "./providers/useMensagens";
import "../css/conversasRecentes.css";
import { useNavigate } from "react-router-dom";

function ConversasRecentes() {
  const { mensagensUsuario } = useMensagens();
  const navigate = useNavigate();

  return (
    <article aria-labelledby="conversas" id="conversas">
      <h2>Conversas recentes</h2>
      <ul>
        {mensagensUsuario &&
          mensagensUsuario.map((mensagem, index) =>
            index < 8 ? (
              <li
                key={mensagem.id_mensagem}
                style={{ cursor: "pointer" }}
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
                />
                <p>{mensagem.nome}</p>
              </li>
            ) : null
          )}
      </ul>
    </article>
  );
}

export default ConversasRecentes;
