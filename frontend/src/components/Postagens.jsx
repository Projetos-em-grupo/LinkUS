import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAutenticador } from "./providers/useAutenticador";
import { usePostagens } from "./providers/usePostagens";
import { createClient } from "@supabase/supabase-js";
import "../css/postagens.css";
import Loading from "./Loading";
import { useConexao } from "./providers/useConexao";

function Postagens({ termo }) {
  const navigate = useNavigate();
  const { usuario, token } = useAutenticador();
  const { postagens, setReloadPostagens } = usePostagens();
  const [postagensFiltradas, setPostagensFiltradas] = useState(postagens);
  const [midia, setMidia] = useState(null);
  const { conexoesUsuario, conexoesUsuarioLoading, acharConexoesPorUsuario } =
    useConexao();

  async function interagirPostagem(postagem, tipo, comentario) {
    if (
      (comentario && !comentario.interacao) ||
      (!comentario && !postagem.interacao)
    ) {
      const data = {
        id_postagem: postagem.id_postagem,
        nomeAutor: usuario.nome,
        tipo,
        id_comentario: comentario ? comentario.id_comentario : null,
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

        setReloadPostagens();
      } catch (error) {
        console.error(error);
      }
    } else if (
      (!comentario &&
        ((postagem.interacao === "like" && tipo == "like") ||
          (postagem.interacao === "dislike" && tipo == "dislike"))) ||
      (comentario &&
        ((comentario.interacao === "like" && tipo == "like") ||
          (comentario.interacao === "dislike" && tipo == "dislike")))
    ) {
      try {
        const res = await fetch(
          `https://link-us-virid.vercel.app/_/backend/interacao/deletarInteracao/${postagem.id_postagem}/${usuario.nome}/${comentario ? comentario.id_comentario : "nenhum"}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.status === 200) setReloadPostagens((prev) => !prev);
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
        id_comentario: comentario ? comentario.id_comentario : null,
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
        else setReloadPostagens((prev) => !prev);
      } catch (error) {
        console.error("Erro interno do servidor: " + error);
      }
    }
  }

  useEffect(() => {
    if (postagens) {
      console.log(postagens);
      const postagensValidas = postagens.filter(
        (p) => p && typeof p === "object"
      );

      if (!termo || (termo.charAt(0) !== "#" && termo.charAt(0) !== "@")) {
        setPostagensFiltradas(
          postagensValidas.filter((postagem) =>
            postagem.texto
              ?.toLowerCase()
              .includes(termo ? termo.toLowerCase() : "")
          )
        );
      } else if (termo.charAt(0) === "@") {
        setPostagensFiltradas(
          postagensValidas.filter((postagem) =>
            postagem.nome
              ?.toLowerCase()
              .includes(termo ? termo.substring(1).toLowerCase() : "")
          )
        );
      } else {
        setPostagensFiltradas(
          postagensValidas.filter((postagem) =>
            postagem.interesses?.some((interesse) =>
              interesse
                .toLowerCase()
                .includes(termo ? termo.substring(1).toLowerCase() : "")
            )
          )
        );
      }
    }
  }, [termo, postagens, setPostagensFiltradas]);

  useEffect(() => {
    if (usuario) acharConexoesPorUsuario(usuario.nome);
  }, [usuario]);

  if (!postagens || conexoesUsuarioLoading) return <Loading />;

  function Comentario({ comentario, post }) {
    return (
      <div id="comentario">
        <img
          id="foto-perfil"
          src={comentario.url_foto ? comentario.url_foto : "./icons/padrao.svg"}
          alt="Foto do usuário"
        />
        <div>
          <h2>{comentario.nome}</h2>
          <p>{comentario.conteudo}</p>
          <div>
            <img
              onClick={async () => interagirPostagem(post, "like", comentario)}
              src={
                comentario.interacao && comentario.interacao === "like"
                  ? "./icons/like-dado.svg"
                  : "./icons/like.svg"
              }
              alt="Ícone de like"
              className="interacao"
            />
            <p>{comentario.positivas}</p>
            <img
              onClick={async () =>
                interagirPostagem(post, "dislike", comentario)
              }
              src={
                comentario.interacao && comentario.interacao === "dislike"
                  ? "./icons/dislike-dado.svg"
                  : "./icons/dislike.svg"
              }
              alt="Ícone de like"
              className="interacao"
            />
            <p>{comentario.negativas}</p>
          </div>
        </div>
      </div>
    );
  }

  function ListarComentarios({ comentarios, post }) {
    return (
      <div>
        {comentarios.map((c) => (
          <Comentario key={c.id_comentario} comentario={c} post={post} />
        ))}
      </div>
    );
  }

  return (
    <div id="postagens">
      <div id="novo-post" className="conteudo">
        <img
          id="foto-perfil"
          src={usuario?.url_foto ?? "./icons/padrao.svg"}
          alt="Foto do usuário"
        />
        <input
          type="text"
          id="novo-post-input"
          placeholder="Digite o que está pensando..."
          onKeyUp={async (e) => {
            if (e.key === "Enter") {
              const info = {};
              info.texto = e.target.value;
              e.target.value = "";
              if (midia && midia.tipo === "imagem") {
                const formData = new FormData();
                formData.append("image", midia.conteudo);
                formData.append("key", "02649a0bafaed4123cfcc89e63003b10");

                try {
                  const res = await fetch("https://api.imgbb.com/1/upload", {
                    method: "POST",
                    body: formData,
                  });

                  const json = await res.json();
                  info.tipo = midia.tipo;
                  info.url_midia = json.data.url;
                } catch (err) {
                  console.error("Erro de rede:", err);
                }
              } else if (midia && midia.tipo === "video") {
                try {
                  const supabase = createClient(
                    "https://uryeqjptemdyznogbeus.supabase.co",
                    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyeWVxanB0ZW1keXpub2diZXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMDI4OTcsImV4cCI6MjA2NDg3ODg5N30.h-xARu8XNys8En6VbKaH_hiBO-oBRPOzUxkgSh3dOPw"
                  );

                  const { data, error } = await supabase.storage
                    .from("linkus")
                    .upload(
                      `videos/${Date.now()}-${midia.conteudo.name
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-zA-Z0-9.]/g, "-")
                        .toLowerCase()}`,
                      midia.conteudo
                    );

                  if (error) return console.error(error);
                  info.url_midia = `https://uryeqjptemdyznogbeus.supabase.co/storage/v1/object/public/linkus/${data.path}`;
                  info.tipo = midia.tipo;
                  console.log(info);
                } catch (error) {
                  console.error(error);
                }
              }

              setMidia(null);
              info.nomeAutor = usuario.nome;

              const result = await fetch(
                "https://link-us-virid.vercel.app/_/backend/postagem/criarPostagem",
                {
                  method: "POST",
                  body: JSON.stringify(info),
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (result.status != 201) console.error(await result.text());
              else setReloadPostagens((val) => !val);
            }
          }}
        />
        <div>
          {midia && <p id="file-name">{midia.conteudo.name}</p>}
          <input
            type="file"
            id="midia"
            accept="image/jpeg, image/png, image/gif, image/bmp, image/webp, video/mp4"
            style={{ display: "none" }}
            onChange={(e) => {
              const arquivo = e.target.files[0];
              if (arquivo.type === "video/mp4")
                setMidia({ tipo: "video", conteudo: arquivo });
              else setMidia({ tipo: "imagem", conteudo: arquivo });
            }}
          />
          <label htmlFor="midia" className="interacao">
            <img src="./icons/enviar.svg" alt="Ícone de adicionar mídia" />
          </label>
        </div>
      </div>
      <ul>
        {postagensFiltradas &&
          postagensFiltradas.map((postagem) => {
            return postagem === undefined ? null : (
              <li
                key={postagem.id_postagem}
                className="conteudo"
                id="conteudo-post"
              >
                <div
                  id="post"
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (postagem.nome !== usuario.nome)
                      navigate(`/usuario`, {
                        state: postagem,
                      });
                  }}
                >
                  <img
                    id="foto-perfil"
                    src={
                      postagem.url_foto
                        ? postagem.url_foto
                        : "./icons/padrao.svg"
                    }
                    alt={`Foto do usuário ${postagem.nome}`}
                  />
                  <div
                    id="info"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        !conexoesUsuario.some(
                          (conexao) => conexao.nome === postagem.nome
                        ) &&
                        usuario.nome !== postagem.nome
                      )
                        navigate(`/usuario`, {
                          state: postagem,
                        });
                    }}
                    style={{ cursor: "pointer" }}
                  >
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
                  <img src={postagem.url_midia} id="imagem-post" />
                )}

                {postagem.tipo_conteudo === "video" && (
                  <video controls width="500" id="video-post">
                    <source src={postagem.url_midia} type="video/mp4" />
                  </video>
                )}
                <ul>
                  <li>
                    <img
                      onClick={() => interagirPostagem(postagem, "like", null)}
                      className="interacao"
                      src={
                        postagem.interacao && postagem.interacao === "like"
                          ? "./icons/like-dado.svg"
                          : "./icons/like.svg"
                      }
                      alt="Ícone de like"
                    />
                    <p>{postagem.positivas}</p>
                  </li>
                  <li>
                    <img
                      onClick={() =>
                        interagirPostagem(postagem, "dislike", null)
                      }
                      className="interacao"
                      src={
                        postagem.interacao && postagem.interacao === "dislike"
                          ? "./icons/dislike-dado.svg"
                          : "./icons/dislike.svg"
                      }
                      alt="Ícone de dislike"
                    />
                    <p>{postagem.negativas}</p>
                  </li>
                  <li id="novo-comentario">
                    <input
                      id={postagem.id_postagem + "-comentario"}
                      type="text"
                      placeholder="comente algo"
                      onKeyUp={async (e) => {
                        if (e.key === "Enter" && e.target.value) {
                          const data = {};
                          data.id_postagem = postagem.id_postagem;
                          data.nomeAutor = usuario.nome;
                          data.conteudo = e.target.value;

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

                            if (result.status != 201)
                              console.error(
                                "Erro ao criar comentário na postagem: " +
                                  (await result.text())
                              );
                            else setReloadPostagens((val) => !val);
                            e.target.value = "";
                          } catch (error) {
                            console.error(error);
                          }
                        }
                      }}
                    />
                  </li>
                </ul>
                <ListarComentarios
                  comentarios={postagem.comentarios}
                  post={postagem}
                />
              </li>
            );
          })}
      </ul>
    </div>
  );
}

export default Postagens;
