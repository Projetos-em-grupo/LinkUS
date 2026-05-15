import React, { useEffect } from "react";
import { useConexao } from "./providers/useConexao";
import Loading from "./Loading";
import { useAutenticador } from "./providers/useAutenticador";
import "../css/amigosUsuario.css";
import { useNavigate } from "react-router-dom";

function AmigosUsuario() {
  const { usuario } = useAutenticador();
  const { conexoesUsuario, conexoesUsuarioLoading, acharConexoesPorUsuario } =
    useConexao();
  const navigate = useNavigate();

  useEffect(() => {
    if (usuario) acharConexoesPorUsuario(usuario.nome);
  }, [usuario]);

  if (conexoesUsuarioLoading) return <Loading />;

  return (
    <div id="amigos-usuario">
      <ul>
        {conexoesUsuario.map((conexao, index) =>
          conexao.status === "aceito" ? (
            <li
              key={index}
              style={{ cursor: "pointer" }}
              onClick={() => {
                navigate("/mensagem", { state: conexao });
              }}
            >
              <img
                id="foto-perfil"
                src={conexao.url_foto || "./icons/padrao.svg"}
                alt="Ícone de perfil do usuário"
              />
              <p>@{conexao.nome}</p>
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
}

export default AmigosUsuario;
