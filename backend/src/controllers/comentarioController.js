import pool from "../db.js";

export async function criarComentarioPostagem(req, res) {
  const comentario = req.body;
  const acharUsuarioPorNomeSQL =
    "SELECT id_usuario from usuario where nome = ?";
  const acharPostagemPorIdSQL =
    "SELECT id_postagem from postagem where id_postagem = ?";
  const acharComentarioPorIdSQL =
    "SELECT id_comentario from comentario where id_comentario = ?";
  const criarComentarioPostagemSQL =
    "INSERT INTO comentario(conteudo, fk_autor, fk_postagem, fk_comentario_pai) values(?, ?, ?, ?)";

  try {
    const [resultAcharUsuarioPorNome] = await pool.query(
      acharUsuarioPorNomeSQL,
      [comentario.nomeAutor]
    );

    if (!resultAcharUsuarioPorNome[0])
      return res.status(404).send("Postagem não encontrada");

    const [resultAcharPostagemPorId] = await pool.query(acharPostagemPorIdSQL, [
      comentario.id_postagem,
    ]);

    if (!resultAcharPostagemPorId[0])
      return res.status(404).send("Postagem não encontrada");

    let resultAcharComentarioPorId;
    if (comentario.id_comentario) {
      [resultAcharComentarioPorId] = await pool.query(acharComentarioPorIdSQL, [
        comentario.id_comentario,
      ]);
      if (!resultAcharComentarioPorId[0])
        return res.status(404).send("Comentário pai não encontrado");
    }

    const [resultCriarComentarioPostagem] = await pool.query(
      criarComentarioPostagemSQL,
      [
        comentario.conteudo,
        resultAcharUsuarioPorNome[0].id_usuario,
        comentario.id_postagem,
        comentario.id_comentario,
      ]
    );

    if (!resultCriarComentarioPostagem)
      return res.status(400).send("Erro ao tentar comentar na postagem");

    return res.status(201).send("Comentário adicionado a postagem com sucesso");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}

export async function acharComentarios(req, res) {
  const acharUsuarioPorEmailSQL =
    "SELECT id_usuario from usuario where nome = ?";
  const acharComentariosSQL =
    "SELECT c.conteudo, u.nome, u.url_foto from comentario c join usuario u on c.fk_autor = u.id_usuario join postagem p on p.id_postagem = c.fk_postagem where p.id_postagem = ?";

  try {
    const [resultAcharComentarios] = await pool.query(acharComentariosSQL, [
      req.params.id_postagem,
    ]);

    if (!resultAcharComentarios)
      return res
        .status(400)
        .send("Erro ao tentar achar os comentários da postagem");

    return res.status(200).send(resultAcharComentarios);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}
