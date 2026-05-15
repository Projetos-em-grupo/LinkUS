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
  const amigos = (conexoesUsuario ?? []).filter(
    (conexao) => conexao.status === "aceito"
  );

  useEffect(() => {
    if (usuario) acharConexoesPorUsuario(usuario.nome);
  }, [usuario, acharConexoesPorUsuario]);

  if (conexoesUsuarioLoading) return <Loading />;

  return (
    <div id="amigos-usuario">
      <h2>Amigos</h2>
      <ul>
        {amigos.map((conexao, index) => (
            <li
              key={index}
              style={{ cursor: "pointer" }}
              onClick={() => {
                navigate("/mensagem", { state: { ...conexao, tipo: "privada" } });
              }}
            >
              <img
                id="foto-perfil"
                src={conexao.url_foto || "./icons/padrao.svg"}
                alt="Ícone de perfil do usuário"
              />
              <p>@{conexao.nome}</p>
            </li>
        ))}
      </ul>
    </div>
  );
}

export default AmigosUsuario;
