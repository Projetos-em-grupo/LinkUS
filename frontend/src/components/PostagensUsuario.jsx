import React, { useEffect, useState } from "react";
import { useAutenticador } from "./providers/useAutenticador";
import { usePostagens } from "./providers/usePostagens";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

function PostagensUsuario() {
  const { usuario, token, setTokenNovo } = useAutenticador();
  const { postagensUsuario, acharPostagensPorUsuario } = usePostagens();
  const [editarPerfil, setEditarPerfil] = useState(false);
  const [novaFoto, setNovaFoto] = useState(null);
  const [novosInteresses, setNovosInteresses] = useState([]);
  const [inputQuantidade, setInputQuantidade] = useState(0);
  const [jaCarregou, setJaCarregou] = useState(false);
  const [fotoPreview, setFotoPreview] = useState("./icons/padrao.svg");

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
    } else {
      data.url_foto = usuario.url_foto;
    }

    const res = await fetch(
      "https://link-us-virid.vercel.app/_/backend/usuario/atualizarUsuario",
      {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.status === 200) {
      setTokenNovo(await res.json());
      setNovaFoto(null);
      setEditarPerfil(false);
    } else {
      console.error("Erro ao tentar atualizar o perfil: " + (await res.text()));
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

        if (res.status === 200) {
          acharPostagensPorUsuario(usuario.nome);
        } else {
          console.error(
            "Erro ao tentar remover interacao: " + (await res.text())
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
          "https://link-us-virid.vercel.app/_/backend/interacao/atualizarInteracao",
          {
            method: "PUT",
            body: JSON.stringify(data),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.status !== 200) {
          console.error(
            "Erro ao tentar atualizar a interacao" + (await res.text())
          );
        } else {
          acharPostagensPorUsuario(usuario.nome);
        }
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
  }, [usuario, jaCarregou, acharPostagensPorUsuario]);

  useEffect(() => {
    if (usuario?.interesses && usuario.interesses[0] != null) {
      setNovosInteresses(usuario.interesses);
    }
  }, [usuario?.interesses]);

  useEffect(() => {
    if (!novaFoto) {
      setFotoPreview(usuario?.url_foto ?? "./icons/padrao.svg");
      return;
    }

    const previewUrl = URL.createObjectURL(novaFoto);
    setFotoPreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [novaFoto, usuario?.url_foto]);

  return (
    <div className="mt-6 max-h-125 overflow-y-auto pr-4">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <img
              id="foto-perfil"
              src={usuario?.url_foto ? usuario.url_foto : "./icons/padrao.svg"}
              alt="Foto de perfil do usuario"
              className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-primary-200 shadow-md"
            />
            <div>
              <p className="font-lato font-bold text-xl text-neutral-800">
                @{usuario?.nome}
              </p>
              <p className="font-lato text-sm text-neutral-600 mt-1">
                Membro desde {new Date().getFullYear()}
              </p>
            </div>
          </div>
          <button
            onClick={() => setEditarPerfil(true)}
            className="px-6 py-3 bg-primary-500 bg-linear-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-600 hover:to-cyan-700 shadow-md hover:shadow-lg rounded-full font-medium hover:bg-primary-600 transition-colors hover:cursor-pointer"
          >
            Editar perfil
          </button>
        </div>

        {usuario?.interesses && usuario.interesses[0] && (
          <div className="mb-6">
            <h3 className="font-lato font-semibold text-lg text-neutral-800 mb-3">
              Interesses
            </h3>
            <div className="flex flex-wrap gap-3">
              {usuario.interesses.map((interesse) => (
                <span
                  key={interesse}
                  className="bg-linear-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-full flex gap-2 items-center shadow-sm"
                >
                  <img
                    src="./icons/hashtag.svg"
                    alt="Icone de hashtag"
                    className="w-4 h-4"
                  />
                  <p className="font-medium text-sm">{interesse}</p>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <ul className="space-y-6">
        {postagensUsuario &&
          postagensUsuario.map((postagem) => (
            <li
              key={postagem.id_postagem}
              className="bg-white rounded-xl shadow-md p-6 border border-neutral-200"
            >
              <div className="flex gap-5 items-start mb-4">
                <img
                  id="foto-perfil"
                  src={postagem.url_foto || "./icons/padrao.svg"}
                  alt={`Foto do usuario ${postagem.nome}`}
                  className="w-12 h-12 rounded-full object-cover shrink-0"
                />
                <div>
                  <h2 className="font-lato font-semibold text-base">
                    {postagem.nome}
                  </h2>
                  <p className="font-poppins text-xs text-neutral-600">
                    {formatDistanceToNow(new Date(postagem.data_criacao), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>

              <p className="font-poppins text-sm mb-4">{postagem.texto}</p>

              {postagem.tipo_conteudo === "imagem" && (
                <img
                  src={postagem.url_midia}
                  alt="Imagem da postagem"
                  className="w-full max-w-2xl max-h-96 rounded-lg object-cover mb-4"
                />
              )}

              {postagem.tipo_conteudo === "video" && (
                <video
                  controls
                  width="500"
                  className="w-full max-w-2xl rounded-lg mb-4"
                >
                  <source src={postagem.url_midia} type="video/mp4" />
                </video>
              )}

              <ul className="flex gap-10 justify-start mt-2">
                <li className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity">
                  <img
                    onClick={() => interagirPostagem(postagem, "like")}
                    src={
                      postagem.interacao === "like"
                        ? "./icons/like-dado.svg"
                        : "./icons/like.svg"
                    }
                    alt="Icone de like"
                    className="w-6 h-6"
                  />
                  <p className="font-poppins text-sm">{postagem.positivas}</p>
                </li>
                <li className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity">
                  <img
                    onClick={() => interagirPostagem(postagem, "dislike")}
                    src={
                      postagem.interacao === "dislike"
                        ? "./icons/dislike-dado.svg"
                        : "./icons/dislike.svg"
                    }
                    alt="Icone de dislike"
                    className="w-6 h-6"
                  />
                  <p className="font-poppins text-sm">{postagem.negativas}</p>
                </li>
              </ul>
            </li>
          ))}
      </ul>

      {editarPerfil && (
        <div
          className="modal flex items-center justify-center p-4"
          onClick={() => setEditarPerfil(false)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl bg-neutral-900 p-6 md:p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <img
                src="./icons/fechar.svg"
                alt="Fechar aba de editar perfil"
                onClick={() => setEditarPerfil(false)}
                className="w-6 h-6 cursor-pointer"
              />
              <p className="font-poppins font-semibold text-neutral-200 text-2xl">
                Editar perfil
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
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

              <label
                htmlFor="midia"
                className="cursor-pointer self-start sm:self-center"
              >
                <img
                  id="foto-perfil"
                  src={fotoPreview}
                  alt="Foto de perfil"
                  className="w-24 h-24 rounded-full object-cover border-4 border-cyan-400 shadow-lg"
                />
              </label>

              <button
                type="button"
                onClick={() => atualizarPerfil()}
                className="self-start sm:self-center bg-linear-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-600 hover:to-cyan-700 shadow-md hover:shadow-lg px-8 py-3 rounded-full font-poppins font-semibold transition-colors"
              >
                salvar
              </button>
            </div>

            <div className="border border-neutral-600 rounded-2xl p-5">
              <div className="flex items-center justify-between gap-4 mb-4">
                <p className="font-poppins font-semibold text-neutral-200 text-xl">
                  Tags
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (inputQuantidade < 5 && (inputQuantidade + novosInteresses.length < 5)) {
                      setInputQuantidade((prev) => prev + 1);
                    }
                  }}
                  className="text-sm text-cyan-300 hover:text-cyan-200 transition-colors cursor-pointer"
                >
                  adicionar tag
                </button>
              </div>

              <ul className="flex flex-wrap gap-3">
                {novosInteresses &&
                  novosInteresses[0] != null &&
                  novosInteresses.map((interesse) => (
                    <li
                      key={interesse}
                      className="bg-primary-500 text-neutral-100 px-3 py-2 rounded-2xl flex items-center gap-2"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setNovosInteresses((prev) =>
                            prev.filter((i) => i !== interesse)
                          )
                        }
                        className="cursor-pointer"
                      >
                        <img
                          src="./icons/fechar.svg"
                          alt="Icone de remover interesse"
                          className="w-4 h-4"
                        />
                      </button>
                      <p className="font-poppins text-sm">{interesse}</p>
                    </li>
                  ))}
              </ul>

              {novosInteresses.length < 5 && inputQuantidade && (function() {
                const inputs = [];
                for (let i = 0; i < inputQuantidade; i++) {
                  inputs.push(
                    <input
                      key={i}
                      type="text"
                      id="interesse"
                      className="mt-4 w-full bg-neutral-800 text-neutral-100 px-4 py-3 border border-neutral-500 rounded-xl font-poppins text-sm focus:outline-none focus:border-cyan-400"
                      placeholder="Digite uma tag"
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          const valor = e.target.value.trim().toLowerCase();
                          if (valor !== "" && !novosInteresses.includes(valor)) {
                            setNovosInteresses((prev) => [...prev, valor]);
                            setInputQuantidade((prev) => prev - 1);
                          }
                          e.target.value = "";
                        }
                      }}
                    />
                  );
                }
                return inputs;
              })()
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostagensUsuario;
