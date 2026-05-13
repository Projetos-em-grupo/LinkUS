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

  const ehAmigo = conexoesUsuario?.some(
    (conexao) => conexao.nome === outroUsuario.nome && conexao.status === "aceito"
  );
  const solicitacaoEnviada = conexoesUsuario?.some(
    (conexao) => conexao.nome === outroUsuario.nome && conexao.status === "solicitado"
  );
  const podeEnviarSolicitacao = !ehAmigo && !solicitacaoEnviada;

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
    <div id="postagens" className="space-y-6">
      <section className="bg-white rounded-[28px] border border-neutral-200 shadow-sm p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <img
              id="foto-perfil"
              src={outroUsuario?.url_foto || "./icons/padrao.svg"}
              alt="Foto de perfil do usuário"
              className="w-20 h-20 rounded-full object-cover border-2 border-neutral-200 shadow-sm"
            />
            <div className="min-w-0">
              <p className="font-poppins font-semibold text-2xl text-neutral-900 truncate">
                @{outroUsuario?.nome}
              </p>
              <p className="mt-2 text-sm leading-6 text-neutral-500">
                {outroUsuario?.descricao || "Perfil público do usuário"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-start md:justify-end">
            {ehAmigo && (
              <button
                type="button"
                onClick={() => {
                  navigate("/mensagem", { state: { ...outroUsuario, tipo: "privada" } });
                }}
                className="rounded-full bg-cyan-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-600"
              >
                Enviar mensagem
              </button>
            )}
            {solicitacaoEnviada && (
              <span className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-600">
                Solicitação enviada
              </span>
            )}
            {podeEnviarSolicitacao && (
              <button
                type="button"
                onClick={() => {
                  enviarSolicitacao(outroUsuario.nome);
                }}
                className="cursor-pointer rounded-full border border-cyan-500 bg-white px-5 py-2 text-sm font-semibold text-cyan-600 shadow-sm transition hover:bg-cyan-50"
              >
                Enviar solicitação
              </button>
            )}
          </div>
        </div>

        {outroUsuario?.interesses && (
          <div className="mt-6 flex flex-wrap gap-2">
            {outroUsuario.interesses.map((interesse) => (
              <span
                key={interesse}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600"
              >
                <img src="./icons/hashtag.svg" alt="Ícone de hashtag" className="w-4 h-4" />
                {interesse}
              </span>
            ))}
          </div>
        )}
      </section>

      {postagensUsuario && postagensUsuario.length > 0 ? (
        <ul className="space-y-4">
          {postagensUsuario.map((postagem) => (
            <li
              key={postagem.id_postagem}
              className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <img
                  src={postagem.url_foto || "./icons/padrao.svg"}
                  alt={`Foto do usuário ${postagem.nome}`}
                  className="w-12 h-12 rounded-full object-cover border border-neutral-200"
                />
                <div className="min-w-0">
                  <h2 className="font-poppins font-semibold text-base text-neutral-900 truncate">
                    {postagem.nome}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    {formatDistanceToNow(new Date(postagem.data_criacao), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-neutral-700 leading-relaxed whitespace-pre-line">
                {postagem.texto}
              </p>

              {postagem.tipo_conteudo === "imagem" && (
                <img
                  src={postagem.url_midia}
                  alt="Imagem da postagem"
                  className="mt-4 max-w-full max-h-112 rounded-3xl border border-neutral-200 object-contain"
                />
              )}

              {postagem.tipo_conteudo === "video" && (
                <div className="mt-4 overflow-hidden rounded-3xl border border-neutral-200">
                  <video controls className="w-full h-auto">
                    <source src={postagem.url_midia} type="video/mp4" />
                  </video>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-neutral-600">
                <button
                  type="button"
                  onClick={() => interagirPostagem(postagem, "like")}
                  className="cursor-pointer inline-flex items-center gap-2 transition hover:text-cyan-600"
                >
                  <img
                    className="w-5 h-5"
                    src={
                      postagem.interacao === "like"
                        ? "./icons/like-dado.svg"
                        : "./icons/like.svg"
                    }
                    alt="Ícone de like"
                  />
                  <span className={postagem.interacao === "like" ? "text-cyan-600 font-semibold" : ""}>
                    {postagem.positivas}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => interagirPostagem(postagem, "dislike")}
                  className="cursor-pointer inline-flex items-center gap-2 transition hover:text-rose-600"
                >
                  <img
                    className="w-5 h-5"
                    src={
                      postagem.interacao === "dislike"
                        ? "./icons/dislike-dado.svg"
                        : "./icons/dislike.svg"
                    }
                    alt="Ícone de dislike"
                  />
                  <span className={postagem.interacao === "dislike" ? "text-rose-600 font-semibold" : ""}>
                    {postagem.negativas}
                  </span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-[28px] border border-neutral-200 bg-white p-8 text-center text-neutral-500 shadow-sm">
          Nenhuma postagem encontrada.
        </div>
      )}
    </div>
  );
}

export default PostagensOutroUsuario;
