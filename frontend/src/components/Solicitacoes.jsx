import React, { useEffect } from "react";
import { useConexao } from "./providers/useConexao";
import { useAutenticador } from "./providers/useAutenticador";
import Loading from "./Loading";
import "../css/solicitacoes.css";

function Solicitacoes() {
  const { usuario, token } = useAutenticador();
  const { conexoesUsuario, conexoesUsuarioLoading, acharConexoesPorUsuario } =
    useConexao();

  useEffect(() => {
    if (usuario) acharConexoesPorUsuario(usuario.nome);
  }, [usuario]);

  if (conexoesUsuarioLoading) return <Loading />;
  console.log(conexoesUsuario);

  return (
    <div id="solicitacoes">
      <h2>Solicitações</h2>
      <ul>
        {conexoesUsuario.map((conexao) => {
          console.log(conexao);
          return conexao.status !== "aceito" &&
            conexao.nome !== usuario.nome &&
            conexao.requisicao === "remetente" ? (
            <li>
              <div>
                <img
                  id="foto-perfil"
                  src={conexao.url_foto || "./icons/padrao.svg"}
                  alt="Ícone de perfil do usuário"
                />
                <p>@{conexao.nome}</p>
              </div>
              <div>
                <a
                  onClick={async () => {
                    const data = {};
                    data.remetente = conexao.nome;
                    data.destinatario = usuario.nome;

                    const result = await fetch(
                      "https://link-us-virid.vercel.app/_/backend/conexao/aceitarSolicitacao",
                      {
                        method: "PUT",
                        body: JSON.stringify(data),
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );

                    if (result.status !== 200)
                      console.error(
                        "Erro ao aceitar a solicitação: " +
                          (await result.text())
                      );

                    acharConexoesPorUsuario(usuario.nome);
                  }}
                >
                  Aceitar
                </a>
                <a
                  onClick={async () => {
                    const data = {};
                    data.remetente = conexao.nome;
                    data.destinatario = usuario.nome;

                    const result = await fetch(
                      "https://link-us-virid.vercel.app/_/backend/conexao/recusarSolicitacao",
                      {
                        method: "DELETE",
                        body: JSON.stringify(data),
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );

                    if (result.status !== 200)
                      console.error(
                        "Erro ao recusar a solicitação: " +
                          (await result.text())
                      );

                    acharConexoesPorUsuario(usuario.nome);
                  }}
                >
                  Recusar
                </a>
              </div>
            </li>
          ) : null;
        })}
      </ul>
    </div>
  );
}

export default Solicitacoes;
