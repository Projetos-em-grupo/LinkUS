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
  }, [usuario, acharConexoesPorUsuario]);

  if (conexoesUsuarioLoading) return <Loading />;

  const solicitacoesPendentes = (conexoesUsuario ?? []).filter(
    (conexao) =>
      conexao.status !== "aceito" &&
      conexao.nome !== usuario.nome &&
      conexao.requisicao === "remetente"
  );

  return (
    <div id="solicitacoes">
      <h2>Solicitações</h2>
      <ul>
        {solicitacoesPendentes.length === 0 ? (
          <li className="solicitacoes-vazias">
            Nenhuma solicitacao pendente no momento.
          </li>
        ) : (
          solicitacoesPendentes.map((conexao, index) => (
            <li key={index}>
              <div>
                <img
                  id="foto-perfil"
                  src={conexao.url_foto || "./icons/padrao.svg"}
                  alt="Icone de perfil do usuario"
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
                        "Erro ao aceitar a solicitacao: " +
                          (await result.text())
                      );

                    acharConexoesPorUsuario(usuario.nome, { force: true });
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
                        "Erro ao recusar a solicitacao: " +
                          (await result.text())
                      );

                    acharConexoesPorUsuario(usuario.nome, { force: true });
                  }}
                >
                  Recusar
                </a>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default Solicitacoes;
