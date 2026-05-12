import React, { useEffect, useState } from "react";
import { usePostagens } from "./providers/usePostagens";
import { useAutenticador } from "./providers/useAutenticador";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useConexao } from "./providers/useConexao";
import { useNavigate } from "react-router-dom";

function PostagensOutroUsuario({ outroUsuario }) {
  const { usuario, token } = useAutenticador();
  const { postagensUsuario, acharPostagensPorUsuario } = usePostagens();
  const { conexoesUsuario, acharConexoesPorUsuario } = useConexao();
  const [jaCarregou, setJaCarregou] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (usuario) acharConexoesPorUsuario(usuario.nome);
  }, [usuario, acharConexoesPorUsuario]);

  useEffect(() => {
    if (outroUsuario.nome && !jaCarregou) {
      acharPostagensPorUsuario(outroUsuario.nome);
      setJaCarregou(true);
    }
  }, [outroUsuario, jaCarregou, acharPostagensPorUsuario]);

  async function enviarSolicitacao(destinatario) {
    const data = {};
    data.remetente = usuario.nome;
    data.destinatario = destinatario;

    try {
      const result = await fetch(
        "https://link-us-virid.vercel.app/_/backend/conexao/enviarSolicitacao",
        {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (result.status != 200)
        console.error("Erro ao mandar a solicitação: " + (await result.text()));
      else acharConexoesPorUsuario(usuario.nome);
    } catch (error) {
      console.error(error);
    }
  }

  async function interagirPostagem(postagem, tipo) {
    if (!postagem.interacao) {
      const data = {
        id_postagem: postagem.id_postagem,
        nomeAutor: usuario.nome,
        tipo,
        id_comentario: null,
      };

      try {
        const result = await fetch(
          "https://link-us-virid.vercel.app/_/backend/interacao/criarInteracao",
          {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (result.status !== 200) {
          console.error(
            "Erro ao tentar interagir na postagem:",
            await result.text()
          );
          return;
        }

        acharPostagensPorUsuario(outroUsuario.nome);
      } catch (error) {
        console.error(error);
      }
    } else if (
      (postagem.interacao === "like" && tipo == "like") ||
      (postagem.interacao === "dislike" && tipo == "dislike")
    ) {
      try {
        const res = await fetch(
          `https://link-us-virid.vercel.app/_/backend/interacao/deletarInteracao/${postagem.id_postagem}/${usuario.nome}/nenhum`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.status === 200) acharPostagensPorUsuario(outroUsuario.nome);
        else {
          console.error(
            "Erro ao tentar remover interação: " + (await res.text())
          );
        }
      } catch (error) {
        console.error("Erro interno do servidor: " + error);
      }
    } else {
      const data = {
        nome: usuario.nome,
        id_postagem: postagem.id_postagem,
        interacao: tipo,
        id_comentario: null,
      };

      try {
        const res = await fetch(
          `https://link-us-virid.vercel.app/_/backend/interacao/atualizarInteracao`,
          {
            method: "PUT",
            body: JSON.stringify(data),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.status !== 200)
          console.error(
            "Erro ao tentar atualizar a interação" + (await res.text())
          );
        else acharPostagensPorUsuario(outroUsuario.nome);
      } catch (error) {
        console.error("Erro interno do servidor: " + error);
      }
    }
  }

  return (
    <div id="postagens">
      <div id="perfil-info">
        <div>
          <img
            id="foto-perfil"
            src={
              outroUsuario?.url_foto
                ? outroUsuario.url_foto
                : "./icons/padrao.svg"
            }
            alt="Foto de perfil do usuário"
          />
          <p>@{outroUsuario?.nome}</p>
        </div>
        {conexoesUsuario &&
          conexoesUsuario.some(
            (conexao) =>
              conexao.nome === outroUsuario.nome && conexao.status === "aceito"
          ) && (
            <a
              onClick={() => {
                navigate("/mensagem", { state: { ...outroUsuario, tipo: "privada" } });
              }}
            >
              Enviar mensagem
            </a>
          )}
        {conexoesUsuario &&
          conexoesUsuario.some(
            (conexao) =>
              conexao.nome === outroUsuario.nome &&
              conexao.status === "solicitado"
          ) && <a className="inative">Solicitação enviada</a>}
        {!conexoesUsuario ||
          (!conexoesUsuario.some(
            (conexao) => conexao.nome === outroUsuario.nome
          ) && (
            <a
              onClick={() => {
                enviarSolicitacao(outroUsuario.nome);
              }}
            >
              Enviar solicitação
            </a>
          ))}
      </div>
      {outroUsuario?.interesses && (
        <ul id="interesses">
          {outroUsuario.interesses.map((interesse) => (
            <li key={interesse}>
              <img src="./icons/hashtag.svg" alt="Ícone de hashtag" />
              <p>{interesse}</p>
            </li>
          ))}
        </ul>
      )}
      <ul>
        {postagensUsuario &&
          postagensUsuario.map((postagem) => (
            <li
              key={postagem.id_postagem}
              className="conteudo"
              id="conteudo-post"
            >
              <div id="post">
                <img
                  id="foto-perfil"
                  src={postagem.url_foto || "./icons/padrao.svg"}
                  alt={`Foto do usuário ${postagem.nome}`}
                />
                <div id="info">
                  <h2>{postagem.nome}</h2>
                  <p>
                    {formatDistanceToNow(new Date(postagem.data_criacao), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>

              <p>{postagem.texto}</p>

              {postagem.tipo_conteudo === "imagem" && (
                <img
                  src={postagem.url_midia}
                  id="imagem-post"
                  alt="Imagem da postagem"
                />
              )}

              {postagem.tipo_conteudo === "video" && (
                <video controls width="500" id="video-post">
                  <source src={postagem.url_midia} type="video/mp4" />
                </video>
              )}

              <ul
                style={{
                  justifyContent: "start",
                  gap: "40px",
                  marginTop: "8px",
                }}
              >
                <li>
                  <img
                    onClick={() => interagirPostagem(postagem, "like")}
                    className="interacao"
                    src={
                      postagem.interacao === "like"
                        ? "./icons/like-dado.svg"
                        : "./icons/like.svg"
                    }
                    alt="Ícone de like"
                  />
                  <p>{postagem.positivas}</p>
                </li>
                <li>
                  <img
                    onClick={() => interagirPostagem(postagem, "dislike")}
                    className="interacao"
                    src={
                      postagem.interacao === "dislike"
                        ? "./icons/dislike-dado.svg"
                        : "./icons/dislike.svg"
                    }
                    alt="Ícone de dislike"
                  />
                  <p>{postagem.negativas}</p>
                </li>
              </ul>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default PostagensOutroUsuario;
