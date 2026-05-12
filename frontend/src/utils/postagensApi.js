export async function criarPostagem(info, token) {
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

  return {
    success: result.status === 201,
    status: result.status,
    message: await result.text(),
  };
}

export async function criarComentario(id_postagem, nomeAutor, conteudo, token) {
  const data = { id_postagem, nomeAutor, conteudo };
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

  return {
    success: result.status === 201,
    status: result.status,
    message: await result.text(),
  };
}

export async function interagirPostagem(postagem, tipo, comentario, usuario, token) {
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

    return { success: result.status === 200, status: result.status };
  }

  if (
    (!comentario &&
      ((postagem.interacao === "like" && tipo === "like") ||
        (postagem.interacao === "dislike" && tipo === "dislike"))) ||
    (comentario &&
      ((comentario.interacao === "like" && tipo === "like") ||
        (comentario.interacao === "dislike" && tipo === "dislike")))
  ) {
    const res = await fetch(
      `https://link-us-virid.vercel.app/_/backend/interacao/deletarInteracao/${postagem.id_postagem}/${usuario.nome}/${comentario ? comentario.id_comentario : "nenhum"}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: res.status === 200, status: res.status };
  }

  const data = {
    nome: usuario.nome,
    id_postagem: postagem.id_postagem,
    interacao: tipo,
    id_comentario: comentario ? comentario.id_comentario : null,
  };

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

  return { success: res.status === 200, status: res.status };
}
