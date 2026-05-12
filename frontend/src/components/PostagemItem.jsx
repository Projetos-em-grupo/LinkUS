import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatPostDate } from "../utils/postagensUtils";
import { interagirPostagem } from "../utils/postagensApi";

function Comentario({ comentario, post, onInteragir }) {
  return (
    <div className="flex gap-6 mb-5">
      <img
        id="foto-perfil"
        src={comentario.url_foto ? comentario.url_foto : "./icons/padrao.svg"}
        alt="Foto do usuário"
        className="w-10 h-10 rounded-full object-cover shrink-0 mt-2"
      />
      <div className="bg-neutral-200 rounded-3xl px-4 py-3 min-w-96">
        <h2 className="font-poppins font-semibold text-sm">{comentario.nome}</h2>
        <p className="font-poppins text-base">{comentario.conteudo}</p>
        <div className="flex gap-4 mt-3">
          <img
            onClick={() => onInteragir(post, "like", comentario)}
            src={
              comentario.interacao && comentario.interacao === "like"
                ? "./icons/like-dado.svg"
                : "./icons/like.svg"
            }
            alt="Ícone de like"
            className="cursor-pointer w-5 h-5 hover:scale-110 transition-transform"
          />
          <p className="text-xs font-poppins">{comentario.positivas}</p>
          <img
            onClick={() => onInteragir(post, "dislike", comentario)}
            src={
              comentario.interacao && comentario.interacao === "dislike"
                ? "./icons/dislike-dado.svg"
                : "./icons/dislike.svg"
            }
            alt="Ícone de dislike"
            className="cursor-pointer w-5 h-5 hover:scale-110 transition-transform"
          />
          <p className="text-xs font-poppins">{comentario.negativas}</p>
        </div>
      </div>
    </div>
  );
}

function ListarComentarios({ comentarios, post, onInteragir }) {
  return (
    <div className="mt-6">
      {comentarios?.map((comentario) => (
        <Comentario
          key={comentario.id_comentario}
          comentario={comentario}
          post={post}
          onInteragir={onInteragir}
        />
      ))}
    </div>
  );
}

function PostagemItem({ postagem, usuario, conexoesUsuario = [], token, setReloadPostagens }) {
  const navigate = useNavigate();
  const [podeInteragir, setPodeInteragir] = useState(true);

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

  async function handleComentarioKeyUp(e) {
    if (e.key !== "Enter" || !e.target.value) return;

    const data = {
      id_postagem: postagem.id_postagem,
      nomeAutor: usuario.nome,
      conteudo: e.target.value,
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
          "Erro ao criar comentário na postagem: " + (await result.text())
        );
      } else {
        setReloadPostagens((val) => !val);
      }
    } catch (error) {
      console.error(error);
    } finally {
      e.target.value = "";
    }
  }

  return (
    <li className="bg-neutral-100 rounded-2xl p-5">
      <div
        className="flex gap-5 items-start cursor-pointer mb-4 hover:opacity-80 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          if (postagem.nome !== usuario.nome) {
            navigate(`/usuario`, { state: postagem });
          } else {
            navigate("/perfil");
          }
        }}
      >
        <img
          id="foto-perfil"
          src={postagem.url_foto ? postagem.url_foto : "./icons/padrao.svg"}
          alt={`Foto do usuário ${postagem.nome}`}
          className="w-12 h-12 rounded-full object-cover shrink-0"
        />
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (
              !conexoesUsuario?.some((conexao) => conexao.nome === postagem.nome) &&
              usuario.nome !== postagem.nome
            ) {
              navigate(`/usuario`, { state: postagem });
            }
          }}
          className="cursor-pointer"
        >
          <h2 className="font-lato font-semibold text-base">{postagem.nome}</h2>
          <p className="font-poppins text-xs text-neutral-600">
            {formatPostDate(postagem.data_criacao)}
          </p>
        </div>
      </div>
      <p className="font-poppins text-sm mb-4">{postagem.texto}</p>

      {postagem.tipo_conteudo === "imagem" && (
        <img
          src={postagem.url_midia}
          alt="Post imagem"
          className="w-full max-w-2xl max-h-96 rounded-lg object-cover mb-4"
        />
      )}

      {postagem.tipo_conteudo === "video" && (
        <video controls width="500" className="w-full max-w-2xl rounded-lg mb-4">
          <source src={postagem.url_midia} type="video/mp4" />
        </video>
      )}

      <div className="border-t-2 border-neutral-300 pt-4 mt-4 flex gap-5">
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <img
            disabled={!podeInteragir}
            onClick={() => handleInteragir(postagem, "like", null)}
            src={
              postagem.interacao && postagem.interacao === "like"
                ? "./icons/like-dado.svg"
                : "./icons/like.svg"
            }
            alt="Ícone de like"
            className={`w-6 h-6 ${!podeInteragir ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <p className="font-poppins text-sm">{postagem.positivas}</p>
        </div>
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <img
            disabled={!podeInteragir}
            onClick={() => handleInteragir(postagem, "dislike", null)}
            src={
              postagem.interacao && postagem.interacao === "dislike"
                ? "./icons/dislike-dado.svg"
                : "./icons/dislike.svg"
            }
            alt="Ícone de dislike"
            className={`w-6 h-6 ${!podeInteragir ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <p className="font-poppins text-sm">{postagem.negativas}</p>
        </div>
        <div className="ml-auto flex-1 max-w-lg">
          <input
            id={`${postagem.id_postagem}-comentario`}
            type="text"
            placeholder="comente algo"
            className="w-full bg-neutral-200 rounded-full px-4 py-2 text-xs font-poppins border-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
            onKeyUp={handleComentarioKeyUp}
          />
        </div>
      </div>

      <ListarComentarios
        comentarios={postagem.comentarios}
        post={postagem}
        onInteragir={handleInteragir}
      />
    </li>
  );
}

export default PostagemItem;
