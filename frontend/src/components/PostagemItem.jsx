import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatPostDate } from "../utils/postagensUtils";
import { interagirPostagem } from "../utils/postagensApi";

function ComentarioAction({
  icon,
  activeIcon,
  isActive,
  label,
  count,
  onClick,
  disabled,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition ${
        isActive
          ? "border-cyan-300 bg-cyan-50 text-cyan-700"
          : "border-neutral-200 bg-white/80 text-neutral-500 hover:border-neutral-300 hover:bg-white"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
      aria-label={label}
    >
      <img
        src={isActive ? activeIcon : icon}
        alt={label}
        className="h-4 w-4 shrink-0"
      />
      <span className="font-poppins text-xs font-medium">{count}</span>
    </button>
  );
}

function Comentario({
  comentario,
  post,
  onInteragir,
  podeInteragir,
  onDeletarComentario,
  deletandoComentarioId,
  usuario,
  conexoesUsuario,
  navigate,
  nivel = 0,
}) {
  const nomeExibicao = comentario.nome || "Usuario";
  const dataExibicao = comentario.data_criacao
    ? formatPostDate(comentario.data_criacao)
    : "Agora";
  const respostas = Array.isArray(comentario.subcomentarios)
    ? comentario.subcomentarios
    : [];
  const podeDeletarComentario =
    usuario &&
    (usuario.nome === nomeExibicao || usuario.funcao === "admin");
  const deletandoComentario = deletandoComentarioId === comentario.id_comentario;

  return (
    <div className={`${nivel > 0 ? "ml-6 border-l border-cyan-100 pl-5" : ""}`}>
      <article className="group relative overflow-hidden rounded-[28px] border border-neutral-200/80 bg-linear-to-br from-white via-slate-50 to-cyan-50/60 p-4 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.55)] transition hover:border-cyan-200/80 hover:shadow-[0_22px_50px_-28px_rgba(34,211,238,0.35)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-300/70 to-transparent opacity-70" />
        {podeDeletarComentario && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeletarComentario(comentario);
            }}
            disabled={deletandoComentario}
            className="cursor-pointer absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            title="Deletar comentario"
          >
            <img
              src="./icons/lixeira.svg"
              alt="Deletar comentario"
              className="h-4 w-4"
            />
          </button>
        )}
        <div className="flex items-start gap-3">
          <img
            id="foto-perfil"
            src={comentario.url_foto ? comentario.url_foto : "./icons/padrao.svg"}
            alt={`Foto do usuario ${nomeExibicao}`}
            className="mt-1 h-11 w-11 shrink-0 cursor-pointer rounded-2xl object-cover ring-2 ring-white"
            onClick={(e) => {
              e.stopPropagation();
              if (nomeExibicao !== usuario.nome) {
                navigate("/usuario", { state: comentario });
              } else {
                navigate("/perfil");
              }
            }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2
                className="cursor-pointer font-lato text-sm font-semibold tracking-[0.01em] text-slate-900 transition-opacity hover:opacity-80"
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    !conexoesUsuario?.some((conexao) => conexao.nome === nomeExibicao) &&
                    usuario.nome !== nomeExibicao
                  ) {
                    navigate("/usuario", { state: comentario });
                  } else if (usuario.nome === nomeExibicao) {
                    navigate("/perfil");
                  }
                }}
              >
                {nomeExibicao}
              </h2>
              <span className="rounded-full bg-white/85 px-2.5 py-1 font-poppins text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                {dataExibicao}
              </span>
            </div>
            <p className="mt-3 whitespace-pre-wrap font-poppins text-sm leading-6 text-slate-700">
              {comentario.conteudo}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <ComentarioAction
                icon="./icons/like.svg"
                activeIcon="./icons/like-dado.svg"
                isActive={comentario.interacao === "like"}
                label="Curtir comentario"
                count={comentario.positivas ?? 0}
                onClick={() => onInteragir(post, "like", comentario)}
                disabled={!podeInteragir}
              />
              <ComentarioAction
                icon="./icons/dislike.svg"
                activeIcon="./icons/dislike-dado.svg"
                isActive={comentario.interacao === "dislike"}
                label="Nao curtir comentario"
                count={comentario.negativas ?? 0}
                onClick={() => onInteragir(post, "dislike", comentario)}
                disabled={!podeInteragir}
              />
              {respostas.length > 0 && (
                <span className="rounded-full bg-slate-900 px-3 py-1.5 font-poppins text-[11px] font-medium uppercase tracking-[0.12em] text-white">
                  {respostas.length} resposta{respostas.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </article>

      {respostas.length > 0 && (
        <div className="mt-3 space-y-3">
          {respostas.map((subcomentario) => (
            <Comentario
              key={subcomentario.id_comentario}
              comentario={subcomentario}
              post={post}
              onInteragir={onInteragir}
              podeInteragir={podeInteragir}
              onDeletarComentario={onDeletarComentario}
              deletandoComentarioId={deletandoComentarioId}
              usuario={usuario}
              conexoesUsuario={conexoesUsuario}
              navigate={navigate}
              nivel={nivel + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ListarComentarios({
  comentarios,
  post,
  onInteragir,
  podeInteragir,
  onDeletarComentario,
  deletandoComentarioId,
  usuario,
  conexoesUsuario,
  navigate,
}) {
  if (!comentarios?.length) {
    return (
      <div className="mt-6 rounded-3xl border border-dashed border-neutral-300 bg-white/70 px-4 py-5 text-center">
        <p className="font-poppins text-sm text-neutral-500">
          Seja a primeira pessoa a comentar esta postagem.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {comentarios.map((comentario) => (
        <Comentario
          key={comentario.id_comentario}
          comentario={comentario}
          post={post}
          onInteragir={onInteragir}
          podeInteragir={podeInteragir}
          onDeletarComentario={onDeletarComentario}
          deletandoComentarioId={deletandoComentarioId}
          usuario={usuario}
          conexoesUsuario={conexoesUsuario}
          navigate={navigate}
        />
      ))}
    </div>
  );
}

function PostagemItem({
  postagem,
  usuario,
  conexoesUsuario = [],
  token,
  setReloadPostagens,
}) {
  const navigate = useNavigate();
  const [podeInteragir, setPodeInteragir] = useState(true);
  const [deletando, setDeletando] = useState(false);
  const [deletandoComentarioId, setDeletandoComentarioId] = useState(null);
  const [textoComentario, setTextoComentario] = useState("");

  async function handleInteragir(post, tipo, comentario) {
    if (!podeInteragir) return;
    setPodeInteragir(false);
    const result = await interagirPostagem(post, tipo, comentario, usuario, token);
    if (result.success) {
      setReloadPostagens((prev) => !prev);
      setTimeout(() => setPodeInteragir(true), 1700);
    } else {
      setPodeInteragir(true);
    }
  }

  async function handleEnviarComentario() {
    if (!textoComentario.trim()) return;
    const data = {
      id_postagem: postagem.id_postagem,
      nomeAutor: usuario.nome,
      conteudo: textoComentario.trim(),
    };

    try {
      const result = await fetch(
        "https://link-us-virid.vercel.app/_/backend/comentario/criarComentarioPostagem",
        {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (result.status !== 201) {
        console.error(
          "Erro ao criar comentario na postagem: " + (await result.text())
        );
      } else {
        setReloadPostagens((val) => !val);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTextoComentario("");
    }
  }

  async function handleDeletarPostagem() {
    if (deletando) return;
    if (!window.confirm("Tem certeza que deseja deletar esta postagem?")) return;

    setDeletando(true);

    try {
      const result = await fetch(
        `https://link-us-virid.vercel.app/_/backend/postagem/deletarPostagem/${postagem.id_postagem}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (result.ok) {
        setReloadPostagens((prev) => !prev);
      } else {
        console.error("Erro ao deletar postagem:", await result.text());
      }
    } catch (error) {
      console.error("Erro ao deletar postagem:", error);
    } finally {
      setDeletando(false);
    }
  }

  async function handleDeletarComentario(comentario) {
    if (deletandoComentarioId) return;
    if (!window.confirm("Tem certeza que deseja deletar este comentario?")) return;

    setDeletandoComentarioId(comentario.id_comentario);

    try {
      const result = await fetch(
        `https://link-us-virid.vercel.app/_/backend/comentario/deletarComentario/${comentario.id_comentario}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (result.ok) {
        setReloadPostagens((prev) => !prev);
      } else {
        console.error("Erro ao deletar comentario:", await result.text());
      }
    } catch (error) {
      console.error("Erro ao deletar comentario:", error);
    } finally {
      setDeletandoComentarioId(null);
    }
  }

  const podeDeletar =
    usuario &&
    (usuario.nome === postagem.nome || usuario.funcao === "admin");

  return (
    <li className="relative rounded-2xl border border-neutral-400/40 bg-neutral-100 p-5 shadow-lg shadow-neutral-700/40">
      {podeDeletar && (
        <button
          type="button"
          onClick={handleDeletarPostagem}
          disabled={deletando}
          className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-slate-700 shadow-md transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          title="Deletar postagem"
        >
          <img
            src="./icons/lixeira.svg"
            alt="Deletar postagem"
            className="h-5 w-5"
          />
        </button>
      )}
      <div
        className="mb-4 flex cursor-pointer items-start gap-5 pr-12 transition-opacity hover:opacity-80"
        onClick={(e) => {
          e.stopPropagation();
          if (postagem.nome !== usuario.nome) {
            navigate("/usuario", { state: postagem });
          } else {
            navigate("/perfil");
          }
        }}
      >
        <img
          id="foto-perfil"
          src={postagem.url_foto ? postagem.url_foto : "./icons/padrao.svg"}
          alt={`Foto do usuario ${postagem.nome}`}
          className="h-12 w-12 shrink-0 rounded-full object-cover"
        />
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (
              !conexoesUsuario?.some((conexao) => conexao.nome === postagem.nome) &&
              usuario.nome !== postagem.nome
            ) {
              navigate("/usuario", { state: postagem });
            }
          }}
          className="cursor-pointer"
        >
          <h2 className="font-lato text-base font-semibold">{postagem.nome}</h2>
          <p className="font-poppins text-xs text-neutral-600">
            {formatPostDate(postagem.data_criacao)}
          </p>
        </div>
      </div>
      <p className="mb-4 font-poppins text-sm">{postagem.texto}</p>

      {postagem.tipo_conteudo === "imagem" && (
        <img
          src={postagem.url_midia}
          alt="Post imagem"
          className="mx-auto mb-4 max-h-96 max-w-full rounded-lg object-contain"
        />
      )}

      {postagem.tipo_conteudo === "video" && (
        <video controls width="500" className="mx-auto mb-4 w-full max-w-2xl rounded-lg">
          <source src={postagem.url_midia} type="video/mp4" />
        </video>
      )}

      <div className="mt-4 flex gap-5 border-t-2 border-neutral-300 pt-4">
        <div className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80">
          <img
            disabled={!podeInteragir}
            onClick={() => handleInteragir(postagem, "like", null)}
            src={
              postagem.interacao && postagem.interacao === "like"
                ? "./icons/like-dado.svg"
                : "./icons/like.svg"
            }
            alt="Icone de like"
            className={`h-6 w-6 ${!podeInteragir ? "cursor-not-allowed opacity-50" : ""}`}
          />
          <p className="font-poppins text-sm">{postagem.positivas}</p>
        </div>
        <div className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80">
          <img
            disabled={!podeInteragir}
            onClick={() => handleInteragir(postagem, "dislike", null)}
            src={
              postagem.interacao && postagem.interacao === "dislike"
                ? "./icons/dislike-dado.svg"
                : "./icons/dislike.svg"
            }
            alt="Icone de dislike"
            className={`h-6 w-6 ${!podeInteragir ? "cursor-not-allowed opacity-50" : ""}`}
          />
          <p className="font-poppins text-sm">{postagem.negativas}</p>
        </div>
        <div className="ml-auto flex-1 max-w-xl">
          <div className="h-12 group flex items-end gap-3 rounded-[26px] border border-neutral-200 bg-linear-to-r from-white to-slate-50 px-3 py-3 shadow-inner shadow-slate-200/40 transition-all duration-200 focus-within:ring-2 focus-within:ring-cyan-500">
            <textarea
              id={`${postagem.id_postagem}-comentario`}
              value={textoComentario}
              onChange={(e) => setTextoComentario(e.target.value)}
              placeholder="comente algo"
              rows="1"
              className="h-8 self-center flex-1 resize-none overflow-hidden bg-transparent px-2 py-1 text-sm leading-5 font-poppins text-slate-700 placeholder:text-neutral-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleEnviarComentario}
              disabled={!textoComentario.trim()}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center self-center rounded-full bg-cyan-500 text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:bg-cyan-200"
              title="Enviar comentario"
            >
              <img
                src="./icons/enviarSolicitacao.svg"
                alt="Enviar comentario"
                className="h-5 w-5 brightness-0 invert"
              />
            </button>
          </div>
        </div>
      </div>

      <ListarComentarios
        comentarios={postagem.comentarios}
        post={postagem}
        onInteragir={handleInteragir}
        podeInteragir={podeInteragir}
        onDeletarComentario={handleDeletarComentario}
        deletandoComentarioId={deletandoComentarioId}
        usuario={usuario}
        conexoesUsuario={conexoesUsuario}
        navigate={navigate}
      />
    </li>
  );
}

export default PostagemItem;
