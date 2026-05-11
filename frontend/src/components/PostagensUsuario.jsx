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
    <div className="mt-6 max-h-125 overflow-y-auto pr-4">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <img
              id="foto-perfil"
              src={usuario?.url_foto ? usuario.url_foto : "./icons/padrao.svg"}
              alt="Foto de perfil do usuário"
              className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-primary-200 shadow-md"
            />
            <div>
              <p className="font-lato font-bold text-xl text-neutral-800">@{usuario?.nome}</p>
              <p className="font-lato text-sm text-neutral-600 mt-1">Membro desde {new Date().getFullYear()}</p>
            </div>
          </div>
          <button
            onClick={() => {
              console.log(usuario);
              setEditarPerfil(true);
            }}
            className="px-6 py-3 bg-primary-500 text-white rounded-full font-medium hover:bg-primary-600 transition-colors shadow-md hover:shadow-lg"
          >
            Editar perfil
          </button>
        </div>
        {usuario?.interesses && usuario.interesses[0] && (
          <div className="mb-6">
            <h3 className="font-lato font-semibold text-lg text-neutral-800 mb-3">Interesses</h3>
            <div className="flex flex-wrap gap-3">
              {usuario.interesses.map((interesse) => (
                <span 
                  key={interesse}
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-full flex gap-2 items-center shadow-sm"
                >
                  <img src="./icons/hashtag.svg" alt="Ícone de hashtag" className="w-4 h-4" />
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
                  alt={`Foto do usuário ${postagem.nome}`}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div>
                  <h2 className="font-lato font-semibold text-base">{postagem.nome}</h2>
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
                <video controls width="500" className="w-full max-w-2xl rounded-lg mb-4">
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
                    alt="Ícone de like"
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
                    alt="Ícone de dislike"
                    className="w-6 h-6"
                  />
                  <p className="font-poppins text-sm">{postagem.negativas}</p>
                </li>
              </ul>
            </li>
          ))}
      </ul>
      {editarPerfil && (
        <div className="modal" onClick={() => setEditarPerfil(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-start items-center mb-5">
              <img
                src="./icons/fechar.svg"
                alt="Fechar aba de editar perfil"
                onClick={() => setEditarPerfil(false)}
                className="w-6 h-6 cursor-pointer"
              />
              <p className="font-poppins font-semibold text-neutral-200 ml-2">Editar perfil</p>
            </div>
            <div className="flex justify-start items-center gap-6 mb-6">
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
              <label htmlFor="midia" className="cursor-pointer">
                <img
                  id="foto-perfil"
                  src={usuario.url_foto ?? "./icons/padrao.svg"}
                  alt="Foto de perfil"
                  className="w-40 h-40 rounded-full object-cover"
                />
              </label>
              <a 
                onClick={() => atualizarPerfil()}
                className="bg-neutral-200 text-primary-600 px-9 py-3 rounded-full font-poppins font-semibold cursor-pointer hover:bg-primary-600 hover:text-white transition-colors"
              >
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
              className="border border-neutral-500 p-5 display-block cursor-pointer"
            >
              <p className="font-poppins font-semibold text-neutral-200 mb-3">Tags</p>
              <ul className="flex flex-wrap gap-3">
                {novosInteresses &&
                  novosInteresses[0] != null &&
                  novosInteresses.map((interesse) => {
                    return (
                      <li 
                        key={interesse}
                        className="bg-primary-500 text-neutral-100 px-3 py-2 rounded-2xl flex items-center gap-2"
                      >
                        <img
                          src="./icons/fechar.svg"
                          alt="Ícone de remover interesse"
                          onClick={() =>
                            setNovosInteresses((prev) =>
                              prev.filter((i) => i !== interesse)
                            )
                          }
                          className="w-4 h-4 cursor-pointer"
                        />
                        <p className="font-poppins text-sm">{interesse}</p>
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
                className="mt-3 bg-dark-800 text-neutral-200 px-4 py-2 border border-neutral-500 rounded-lg font-poppins text-sm focus:outline-none focus:border-primary-500"
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