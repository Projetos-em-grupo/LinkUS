import React, { useEffect, useState } from "react";
import { useAutenticador } from "./providers/useAutenticador";
import { usePostagens } from "./providers/usePostagens";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import "../css/postagensUsuario.css";

function PostagensUsuario() {
  const { usuario, token, setTokenNovo } = useAutenticador();
  const { postagensUsuario, acharPostagensPorUsuario } = usePostagens();
  const [editarPerfil, setEditarPerfil] = useState(false);
  const [novaFoto, setNovaFoto] = useState(null);
  const [novosInteresses, setNovosInteresses] = useState([]);
  const [ativarInput, setAtivarInput] = useState(false);
  const [jaCarregou, setJaCarregou] = useState(false);

  async function atualizarPerfil() {
    const data = {};
    data.email = usuario.email;
    data.interesses = novosInteresses;
    if (novaFoto) {
      const formData = new FormData();
      formData.append("image", novaFoto);
      formData.append("key", "02649a0bafaed4123cfcc89e63003b10");

      try {
        const res = await fetch("https://api.imgbb.com/1/upload", {
          method: "POST",
          body: formData,
        });

        const json = await res.json();
        data.url_foto = json.data.url;
      } catch (err) {
        console.error("Erro de rede:", err);
      }
    } else data.url_foto = usuario.url_foto;

    const res = await fetch("https://link-us-virid.vercel.app/_/backend/usuario/atualizarUsuario", {
      method: "PUT",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 200) setTokenNovo(await res.json());
    else
      console.error("Erro ao tentar atualizar o perfil: " + (await res.text()));

    setNovosInteresses(usuario.interesses);
    setNovaFoto(null);
    setEditarPerfil(false);
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

        acharPostagensPorUsuario(usuario.nome);
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

        if (res.status === 200) acharPostagensPorUsuario(usuario.nome);
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
        else acharPostagensPorUsuario(usuario.nome);
      } catch (error) {
        console.error("Erro interno do servidor: " + error);
      }
    }
  }

  useEffect(() => {
    if (usuario && !jaCarregou) {
      acharPostagensPorUsuario(usuario.nome);
      setJaCarregou(true);
    }
  }, [usuario]);

  useEffect(() => {
    if (usuario?.interesses && usuario.interesses[0] != null)
      setNovosInteresses(usuario.interesses);
  }, [usuario?.interesses]);

  return (
    <div id="postagens">
      <div id="perfil-info">
        <div>
          <img
            id="foto-perfil"
            src={usuario?.url_foto ? usuario.url_foto : "./icons/padrao.svg"}
            alt="Foto de perfil do usuário"
          />
          <p>@{usuario?.nome}</p>
        </div>
        <a
          onClick={() => {
            console.log(usuario);
            setEditarPerfil(true);
          }}
        >
          <p>editar perfil</p>
        </a>
      </div>
      {usuario?.interesses && usuario.interesses[0] && (
        <ul id="interesses">
          {usuario.interesses.map((interesse) => (
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
      {editarPerfil && (
        <div className="modal" onClick={() => setEditarPerfil(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div id="comeco">
              <img
                src="./icons/fechar.svg"
                alt="Fechar aba de editar perfil"
                onClick={() => setEditarPerfil(false)}
              />
              <p>Editar perfil</p>
            </div>
            <div>
              <input
                type="file"
                id="midia"
                name="midia"
                accept="image/jpeg, image/png, image/gif, image/bmp, image/webp"
                style={{ display: "none" }}
                onChange={(e) => {
                  setNovaFoto(e.target.files[0]);
                }}
              />
              <label htmlFor="midia">
                <img
                  id="foto-perfil"
                  src={usuario.url_foto ?? "./icons/padrao.svg"}
                  alt="Foto de perfil"
                />
              </label>
              <a onClick={() => atualizarPerfil()}>
                <p>salvar</p>
              </a>
            </div>
            <label
              htmlFor={ativarInput ? "interesse" : ""}
              onClick={() => {
                if (novosInteresses.length < 5) {
                  setAtivarInput(true);
                }
              }}
            >
              <p>Tags</p>
              <ul>
                {novosInteresses &&
                  novosInteresses[0] != null &&
                  novosInteresses.map((interesse) => {
                    return (
                      <li key={interesse}>
                        <img
                          src="./icons/fechar.svg"
                          alt="Ícone de remover interesse"
                          onClick={() =>
                            setNovosInteresses((prev) =>
                              prev.filter((i) => i !== interesse)
                            )
                          }
                        />
                        <p>{interesse}</p>
                      </li>
                    );
                  })}
              </ul>
              <input
                type="text"
                id="interesse"
                style={{
                  display: novosInteresses.length >= 5 ? "none" : "block",
                }}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    const valor = e.target.value.trim().toLowerCase();
                    if (valor !== "" && !novosInteresses.includes(valor)) {
                      setNovosInteresses((prev) => {
                        console.log([...prev, valor]);
                        return [...prev, valor];
                      });
                      e.target.value = "";
                    }
                    if (novosInteresses.length + 1 >= 5) {
                      setAtivarInput(false);
                    }
                  }
                }}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostagensUsuario;
