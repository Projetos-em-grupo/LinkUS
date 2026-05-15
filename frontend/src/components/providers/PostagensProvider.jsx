import React, { useEffect, useState, useCallback } from "react";
import { PostagensContext } from "./usePostagens";
import { useAutenticador } from "./useAutenticador";

function coletarIdsComentarios(comentarios = []) {
  return comentarios.flatMap((comentario) => [
    comentario.id_comentario,
    ...coletarIdsComentarios(comentario.subcomentarios || []),
  ]);
}

function aplicarInteracoesNosComentarios(comentarios = [], interacoesComentarios = {}) {
  return comentarios.map((comentario) => ({
    ...comentario,
    interacao: interacoesComentarios[comentario.id_comentario],
    subcomentarios: aplicarInteracoesNosComentarios(
      comentario.subcomentarios || [],
      interacoesComentarios
    ),
  }));
}

export function PostagensProvider({ children }) {
  const { token, usuario } = useAutenticador();
  const [postagensLoading, setPostagensLoading] = useState(true);
  const [postagens, setPostagens] = useState([]);
  const [postagensUsuarioLoading, setPostagensUsuarioLoading] = useState(true);
  const [postagensUsuario, setPostagensUsuario] = useState([]);
  const [reloadPostagens, setReloadPostagens] = useState(false);

  function ordenarPorDataDesc(posts) {
    return [...posts].sort(
      (a, b) => new Date(b.data_criacao) - new Date(a.data_criacao)
    );
  }

  const buscarInteracoesEmLote = useCallback(
    async ({ idsPostagens = [], idsComentarios = [] }) => {
      if (!usuario?.email || (!idsPostagens.length && !idsComentarios.length)) {
        return { postagens: {}, comentarios: {} };
      }

      try {
        const result = await fetch(
          "https://link-us-virid.vercel.app/_/backend/interacao/listarInteracoesUsuario",
          {
            method: "POST",
            body: JSON.stringify({
              email: usuario.email,
              ids_postagens: idsPostagens,
              ids_comentarios: idsComentarios,
            }),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (result.status !== 200) {
          console.error("Erro ao buscar interacoes em lote:", await result.text());
          return { postagens: {}, comentarios: {} };
        }

        return await result.json();
      } catch (error) {
        console.error("Erro ao buscar interacoes em lote:", error);
        return { postagens: {}, comentarios: {} };
      }
    },
    [token, usuario]
  );

  const enriquecerPostsComInteracoes = useCallback(
    async (posts, { incluirComentarios = false } = {}) => {
      if (!usuario || !Array.isArray(posts) || posts.length === 0) {
        return posts;
      }

      const idsPostagens = posts.map((post) => post.id_postagem);
      const idsComentarios = incluirComentarios
        ? posts.flatMap((post) => coletarIdsComentarios(post.comentarios || []))
        : [];

      const interacoes = await buscarInteracoesEmLote({
        idsPostagens,
        idsComentarios,
      });

      return posts.map((post) => ({
        ...post,
        interacao: interacoes.postagens?.[post.id_postagem],
        comentarios: incluirComentarios
          ? aplicarInteracoesNosComentarios(
              post.comentarios || [],
              interacoes.comentarios || {}
            )
          : post.comentarios,
      }));
    },
    [buscarInteracoesEmLote, usuario]
  );

  const acharPostagensPorUsuario = useCallback(
    async (nome) => {
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
          console.log("Erro de requisicao: " + (await result.text()));
          return;
        }

        let posts = await result.json();
        posts = await enriquecerPostsComInteracoes(posts);

        setPostagensUsuario(ordenarPorDataDesc(posts));
      } catch (error) {
        console.error("Erro de requisicao" + error);
      } finally {
        setPostagensUsuarioLoading(false);
      }
    },
    [enriquecerPostsComInteracoes, token]
  );

  useEffect(() => {
    async function acharPostagens() {
      setPostagensLoading(true);

      try {
        const res = await fetch(
          "https://link-us-virid.vercel.app/_/backend/postagem/acharPostagens",
          {
            method: "GET",
          }
        );

        if (res.status !== 200) {
          console.log("Erro de requisicao: " + (await res.text()));
          return;
        }

        let posts = await res.json();
        posts = await enriquecerPostsComInteracoes(posts, {
          incluirComentarios: true,
        });

        setPostagens(ordenarPorDataDesc(posts));
      } catch (error) {
        console.error("Erro ao carregar as postagens" + error);
      } finally {
        setPostagensLoading(false);
      }
    }

    acharPostagens();
  }, [enriquecerPostsComInteracoes, reloadPostagens]);

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
