import pool from "../db.js";

export async function criarInteracao(req, res) {
  const interacao = req.body;
  const acharUsuarioPorNomeSQL =
    "SELECT id_usuario from usuario where nome = ?";
  const acharPostagemPorIdSQL =
    "SELECT id_postagem from postagem where id_postagem = ?";
  const acharComentarioPorIdSQL =
    "SELECT id_comentario from comentario where id_comentario = ?";
  const acharInteracaoExistentePostSQL =
    "SELECT id_interacao from interacao where fk_usuario = ? and fk_postagem = ? and fk_comentario is null limit 1";
  const acharInteracaoExistenteComentarioSQL =
    "SELECT id_interacao from interacao where fk_usuario = ? and fk_postagem = ? and fk_comentario = ? limit 1";
  const criarInteracaoSQL =
    "INSERT INTO interacao(tipo, fk_usuario, fk_postagem, fk_comentario) values(?, ?, ?, ?)";

  try {
    const [resultAcharUsuarioPorNome] = await pool.query(
      acharUsuarioPorNomeSQL,
      [interacao.nomeAutor]
    );

    if (!resultAcharUsuarioPorNome[0])
      return res.status(404).send("Postagem nao encontrada");

    const [resultAcharPostagemPorId] = await pool.query(acharPostagemPorIdSQL, [
      interacao.id_postagem,
    ]);

    if (!resultAcharPostagemPorId[0])
      return res.status(404).send("Postagem nao encontrada");

    let resultAcharComentarioPorId;
    if (interacao.id_comentario) {
      [resultAcharComentarioPorId] = await pool.query(acharComentarioPorIdSQL, [
        interacao.id_comentario,
      ]);
      if (!resultAcharComentarioPorId[0])
        return res.status(404).send("Comentario pai nao encontrado");
    }

    const usuarioId = resultAcharUsuarioPorNome[0].id_usuario;
    const [resultInteracaoExistente] = await pool.query(
      interacao.id_comentario
        ? acharInteracaoExistenteComentarioSQL
        : acharInteracaoExistentePostSQL,
      interacao.id_comentario
        ? [usuarioId, interacao.id_postagem, interacao.id_comentario]
        : [usuarioId, interacao.id_postagem]
    );

    if (resultInteracaoExistente[0]) {
      return res.status(409).send("Usuario ja interagiu neste item");
    }

    const [resultCriarInteracao] = await pool.query(criarInteracaoSQL, [
      interacao.tipo,
      usuarioId,
      interacao.id_postagem,
      interacao.id_comentario,
    ]);

    if (!resultCriarInteracao)
      return res.status(400).send("Erro ao tentar interagir na postagem");

    return res.status(200).send("Interacao adicionada a postagem com sucesso");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}

export async function deletarInteracao(req, res) {
  const { nome, id_postagem, id_comentario } = req.params;
  let deletarInteracaoSQL;
  if (id_comentario === "nenhum")
    deletarInteracaoSQL =
      "DELETE FROM interacao i USING usuario u WHERE i.fk_usuario = u.id_usuario AND u.nome = ? AND i.fk_postagem = ? AND i.fk_comentario is null";
  else
    deletarInteracaoSQL =
      "DELETE FROM interacao i USING usuario u WHERE i.fk_usuario = u.id_usuario AND u.nome = ? AND i.fk_postagem = ? AND i.fk_comentario = ?";

  try {
    const params =
      id_comentario === "nenhum"
        ? [nome, id_postagem]
        : [nome, id_postagem, id_comentario];
    const [resultDeletarInteracao] = await pool.query(
      deletarInteracaoSQL,
      params
    );
    if (!resultDeletarInteracao)
      return res.status(404).send("Usuario nao encontrado");
    return res.status(200).send("Interacao removida com sucesso");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}

export async function atualizarInteracao(req, res) {
  const { nome, id_postagem, interacao, id_comentario } = req.body || null;
  let atualizarInteracaoSQL;
  if (!id_comentario)
    atualizarInteracaoSQL =
      "UPDATE interacao i SET tipo = ? FROM usuario u WHERE i.fk_usuario = u.id_usuario AND u.nome = ? AND i.fk_postagem = ? AND i.fk_comentario is null";
  else
    atualizarInteracaoSQL =
      "UPDATE interacao i SET tipo = ? FROM usuario u WHERE i.fk_usuario = u.id_usuario AND u.nome = ? AND i.fk_postagem = ? AND i.fk_comentario = ?";

  try {
    const params = !id_comentario
      ? [interacao, nome, id_postagem]
      : [interacao, nome, id_postagem, id_comentario];
    const [resultAtualizarInteracao] = await pool.query(
      atualizarInteracaoSQL,
      params
    );

    if (!resultAtualizarInteracao)
      return res.status(404).send("Usuario nao encontrado");

    return res.status(200).send("Interacao no post atualizada com sucesso");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}

export async function temInteracaoPost(req, res) {
  const { email, id_postagem } = req.body;
  const temInteracaoSQL =
    "SELECT i.tipo from interacao i join usuario u on u.id_usuario = i.fk_usuario where u.email = ? and i.fk_postagem = ? and fk_comentario is null limit 1";

  try {
    const [resultTemInteracao] = await pool.query(temInteracaoSQL, [
      email,
      id_postagem,
    ]);
    if (!resultTemInteracao)
      return res
        .status(400)
        .send("Erro ao tentar verificar se o usuario interagiu na postagem");
    if (!resultTemInteracao[0])
      return res.status(202).send("Usuario nao interagiu na postagem");

    return res.status(200).send({ tipo: resultTemInteracao[0].tipo });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}

export async function temInteracaoComentario(req, res) {
  const { email, id_comentario } = req.body;
  const temInteracaoSQL =
    "SELECT i.tipo from interacao i join usuario u on u.id_usuario = i.fk_usuario join comentario c on c.id_comentario = i.fk_comentario where u.email = ? and c.id_comentario = ? limit 1";

  try {
    const [result] = await pool.query(temInteracaoSQL, [email, id_comentario]);

    if (!result || result.length === 0)
      return res.status(202).send("Usuario nao interagiu no comentario");

    return res.status(200).send({ tipo: result[0].tipo });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}

export async function listarInteracoesUsuario(req, res) {
  const { email, ids_postagens = [], ids_comentarios = [] } = req.body || {};

  if (!email) {
    return res.status(400).send("Email do usuario e obrigatorio");
  }

  try {
    const interacoes = {
      postagens: {},
      comentarios: {},
    };

    if (Array.isArray(ids_postagens) && ids_postagens.length > 0) {
      const placeholders = ids_postagens.map(() => "?").join(",");
      const listarInteracoesPostSQL = `
        SELECT i.fk_postagem, i.tipo
        FROM interacao i
        JOIN usuario u ON u.id_usuario = i.fk_usuario
        WHERE u.email = ?
          AND i.fk_comentario IS NULL
          AND i.fk_postagem IN (${placeholders})
      `;

      const [resultPostagens] = await pool.query(listarInteracoesPostSQL, [
        email,
        ...ids_postagens,
      ]);

      for (const interacao of resultPostagens) {
        interacoes.postagens[interacao.fk_postagem] = interacao.tipo;
      }
    }

    if (Array.isArray(ids_comentarios) && ids_comentarios.length > 0) {
      const placeholders = ids_comentarios.map(() => "?").join(",");
      const listarInteracoesComentarioSQL = `
        SELECT i.fk_comentario, i.tipo
        FROM interacao i
        JOIN usuario u ON u.id_usuario = i.fk_usuario
        WHERE u.email = ?
          AND i.fk_comentario IN (${placeholders})
      `;

      const [resultComentarios] = await pool.query(listarInteracoesComentarioSQL, [
        email,
        ...ids_comentarios,
      ]);

      for (const interacao of resultComentarios) {
        interacoes.comentarios[interacao.fk_comentario] = interacao.tipo;
      }
    }

    return res.status(200).send(interacoes);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}
