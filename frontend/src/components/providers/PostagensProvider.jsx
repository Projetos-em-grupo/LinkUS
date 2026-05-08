import React, { useEffect, useState } from "react";
import { PostagensContext } from "./usePostagens";
import { useAutenticador } from "./useAutenticador";

export function PostagensProvider({ children }) {
  const { token, usuario } = useAutenticador();
  const [postagensLoading, setPostagensLoading] = useState(true);
  const [postagens, setPostagens] = useState(null);
  const [postagensUsuarioLoading, setPostagensUsuarioLoading] = useState(true);
  const [postagensUsuario, setPostagensUsuario] = useState(null);
  const [reloadPostagens, setReloadPostagens] = useState(false);

  async function acharPostagensPorUsuario(nome) {
    setPostagensUsuarioLoading(true);
    try {
      const result = await fetch(
        `https://link-us-virid.vercel.app/_/backend/postagem/acharPostagensUsuario/${nome}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (result.status !== 200) {
        console.log("Erro de requisição: " + (await result.text()));
        return;
      }

      let posts = await result.json();

      if (usuario) {
        const novosPosts = await Promise.all(
          posts.map(async (post) => {
            try {
              const resInteracao = await fetch(
                `https://link-us-virid.vercel.app/_/backend/interacao/temInteracaoPost`,
                {
                  method: "POST",
                  body: JSON.stringify({
                    id_postagem: post.id_postagem,
                    email: usuario.email,
                  }),
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (resInteracao.status === 200) {
                const json = await resInteracao.json();
                post.interacao = json.tipo;
              }
            } catch (err) {
              console.error("Erro ao buscar interação:", err);
            }

            return post;
          })
        );

        posts = novosPosts;
      }

      setPostagensUsuario(posts);
    } catch (error) {
      console.error("Erro de requisição" + error);
    } finally {
      setPostagensUsuarioLoading(false);
    }
  }

  useEffect(() => {
    async function acharPostagens() {
      try {
        const res = await fetch(
          "https://link-us-virid.vercel.app/_/backend/postagem/acharPostagens",
          {
            method: "GET",
          }
        );

        if (res.status !== 200) {
          console.log("Erro de requisição: " + (await res.text()));
          return;
        }

        let posts = await res.json();

        if (usuario) {
          const novosPosts = await Promise.all(
            posts.map(async (post) => {
              try {
                const resInteracao = await fetch(
                  `https://link-us-virid.vercel.app/_/backend/interacao/temInteracaoPost`,
                  {
                    method: "POST",
                    body: JSON.stringify({
                      id_postagem: post.id_postagem,
                      email: usuario.email,
                    }),
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                if (resInteracao.status === 200) {
                  const json = await resInteracao.json();
                  post.interacao = json.tipo;
                } else if (resInteracao.status !== 202) {
                  console.error("Erro " + (await resInteracao.text()));
                  return;
                }

                if (Array.isArray(post.comentarios)) {
                  const novosComentarios = await Promise.all(
                    post.comentarios.map(async (comentario) => {
                      try {
                        const resInteracaoComent = await fetch(
                          `https://link-us-virid.vercel.app/_/backend/interacao/temInteracaoComentario`,
                          {
                            method: "POST",
                            body: JSON.stringify({
                              id_comentario: comentario.id_comentario,
                              email: usuario.email,
                            }),
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                          }
                        );

                        if (resInteracaoComent.status === 200) {
                          const json = await resInteracaoComent.json();
                          comentario.interacao = json.tipo;
                        }
                      } catch (err) {
                        console.error(
                          "Erro ao verificar interação no comentário",
                          err
                        );
                      }

                      return comentario;
                    })
                  );

                  post.comentarios = novosComentarios;
                }
              } catch (err) {
                console.error("Erro ao buscar interação:", err);
              }

              return post;
            })
          );

          posts = novosPosts;
        }

        setPostagens(posts);
      } catch (error) {
        console.error("Erro ao carregar as postagens" + error);
      } finally {
        setPostagensLoading(false);
      }
    }

    acharPostagens();
  }, [reloadPostagens, usuario]);

  return (
    <PostagensContext.Provider
      value={{
        postagensLoading,
        setReloadPostagens,
        setPostagens,
        postagens,
        postagensUsuario,
        postagensUsuarioLoading,
        acharPostagensPorUsuario,
      }}
    >
      {children}
    </PostagensContext.Provider>
  );
}
