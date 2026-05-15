import pool from "../db.js";

export async function mandarMensagem(req, res) {
  const { nomeRemetente, nomeDestinatario, texto } = req.body;
  const acharUsuarioPorNomeSQL =
    "SELECT id_usuario from usuario where nome = ?";
  const mandarMensagemSQL =
    "INSERT INTO mensagem(texto, fk_destinatario, fk_remetente) values(?, ?, ?)";

  try {
    const [resultAcharRemetente] = await pool.query(acharUsuarioPorNomeSQL, [
      nomeRemetente,
    ]);
    if (!resultAcharRemetente[0])
      return res.status(404).send("Remetente não encontrado");

    const [resultAcharDestinatario] = await pool.query(acharUsuarioPorNomeSQL, [
      nomeDestinatario,
    ]);
    if (!resultAcharDestinatario[0])
      return res.status(404).send("Destinatário não encontrado");

    const [resultMandarMensagem] = await pool.query(mandarMensagemSQL, [
      texto,
      resultAcharDestinatario[0].id_usuario,
      resultAcharRemetente[0].id_usuario,
    ]);

    if (!resultMandarMensagem)
      return res.status(400).send("Erro ao enviar a mensagem");

    return res.status(200).send("Mensagem enviada com sucesso");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}

export async function excluirMensagem(req, res) {
  const { nomeUsuario, nomeAmigo, id_mensagem } = req.body;
  const acharUsuarioPorNomeSQL =
    "select id_usuario from usuario u where nome = ?";
  const excluirMensagemSQL =
    "delete from mensagem where fk_remetente = ? and fk_destinatario = ? and id_mensagem = ?";

  try {
    const [resultAcharRemetente] = await pool.query(acharUsuarioPorNomeSQL, [
      nomeUsuario,
    ]);
    if (!resultAcharRemetente[0])
      return res.status(404).send("Remetente não encontrado");

    const [resultAcharDestinatario] = await pool.query(acharUsuarioPorNomeSQL, [
      nomeAmigo,
    ]);
    if (!resultAcharDestinatario[0])
      return res.status(404).send("Destinatário não encontrado");

    const [result] = await pool.query(excluirMensagemSQL, [
      resultAcharRemetente[0].id_usuario,
      resultAcharDestinatario[0].id_usuario,
      id_mensagem,
    ]);

    if (result.affectedRows === 0)
      return res
        .status(403)
        .send("Não é possível deletar mensagens de outros usuários");

    return res.status(200).send("Mensagem deletada com sucesso");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}

export async function atualizarStatusMensagens(req, res) {
  const { nomeRemetente, nomeDestinatario, status } = req.body;
  const acharUsuarioPorNomeSQL =
    "SELECT id_usuario from usuario where nome = ?";
  let atualizarStatusMensagensSQL;
  if (status == "entregue")
    atualizarStatusMensagensSQL =
      "UPDATE mensagem set status = 'entregue' where status = 'enviado'";
  else if (status == "visualizado")
    atualizarStatusMensagensSQL =
      "UPDATE mensagem set status = 'visualizado' where status = 'entregue'";
  else return res.status(400).send("Insira um status válido");
  try {
    const [resultAcharRemetente] = await pool.query(acharUsuarioPorNomeSQL, [
      nomeRemetente,
    ]);
    if (!resultAcharRemetente[0])
      return res.status(404).send("Remetente não encontrado");

    const [resultAcharDestinatario] = await pool.query(acharUsuarioPorNomeSQL, [
      nomeDestinatario,
    ]);
    if (!resultAcharDestinatario[0])
      return res.status(404).send("Destinatário não encontrado");

    const [resultAtualizarStatusMensagens] = await pool.query(
      atualizarStatusMensagensSQL
    );
    if (!resultAtualizarStatusMensagens)
      return res
        .status(400)
        .send("Erro ao tentar atualizar os status das mensagens");

    return res.status(200).send("Mensagens atualizadas com sucesso");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}

export async function listarConversasUsuario(req, res) {
  const { email } = req.params;

  if (!email) return res.status(400).send("Informe todos os campos");

  try {
    const [[usuario]] = await pool.query(
      "SELECT id_usuario FROM usuario WHERE email = ?",
      [email]
    );

    if (!usuario) return res.status(404).send("Usuário não encontrado");

    const idUsuario = usuario.id_usuario;

    const listarConversasUsuarioSQL = `
      SELECT 
      m.id_mensagem,
      m.texto,
      m.data_envio,
      u.nome,
      u.url_foto,
      'privada' as tipo
      FROM mensagem m
      JOIN usuario u ON 
      (m.fk_remetente = ? AND m.fk_destinatario = u.id_usuario) OR 
      (m.fk_destinatario = ? AND m.fk_remetente = u.id_usuario)
      WHERE
      (? IN (m.fk_remetente, m.fk_destinatario))
        AND m.data_envio = (
          SELECT MAX(m2.data_envio)
          FROM mensagem m2 
          WHERE
              (m2.fk_remetente = m.fk_remetente AND m2.fk_destinatario = m.fk_destinatario) OR
              (m2.fk_remetente = m.fk_destinatario AND m2.fk_destinatario = m.fk_remetente)
      )
      ORDER BY m.data_envio DESC
    `;

    const listarConversasGrupoSQL = `
      SELECT 
        g.id_grupo,
        g.nome,
        g.descricao,
        g.data_criacao,
        m.texto,
        m.data_envio,
        'grupo' AS tipo
      FROM grupo g
      JOIN participante p ON p.fk_grupo = g.id_grupo
      LEFT JOIN mensagem m ON m.id_mensagem = (
        SELECT id_mensagem FROM mensagem
        WHERE fk_grupo = g.id_grupo
        ORDER BY data_envio DESC
        LIMIT 1
      )
      WHERE p.fk_participante = ?
      ORDER BY m.data_envio DESC
    `;

    const [conversas] = await pool.query(listarConversasUsuarioSQL, [
      idUsuario,
      idUsuario,
      idUsuario,
    ]);

    const [conversasGrupos] = await pool.query(listarConversasGrupoSQL, [
      idUsuario,
    ]);

    const todasConversas = [...conversas, ...conversasGrupos];

    todasConversas.sort(
      (a, b) => new Date(b.data_envio) - new Date(a.data_envio)
    );

    return res.status(200).send(todasConversas);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}

export async function listarMensagensConversa(req, res) {
  const { nome_1, nome_2, tipo } = req.params;

  if (!nome_1 || !nome_2 || !tipo)
    return res.status(400).send("Informe todos os campos");

  const acharUsuarioSQL = "SELECT id_usuario FROM usuario WHERE nome = ?";
  const acharGrupoSQL = "SELECT id_grupo FROM grupo WHERE nome = ?";

  try {
    if (tipo === "privada") {
      const listarConversasUsuarioSQL = `
        SELECT 
          m.id_mensagem,
          m.texto,
          m.data_envio,
          m.status,
          remetente.nome AS nome_remetente,
          remetente.id_usuario AS id_remetente
        FROM mensagem m
        JOIN usuario remetente ON remetente.id_usuario = m.fk_remetente
        WHERE 
          (
            (m.fk_remetente = ? AND m.fk_destinatario = ?) OR 
            (m.fk_remetente = ? AND m.fk_destinatario = ?)
          )
          AND m.fk_grupo IS NULL
        ORDER BY m.data_envio ASC
      `;

      const [[remetente]] = await pool.query(acharUsuarioSQL, [nome_1]);
      const [[destinatario]] = await pool.query(acharUsuarioSQL, [nome_2]);

      if (!remetente || !destinatario)
        return res.status(404).send("Usuário(s) não encontrado(s)");

      const [result] = await pool.query(listarConversasUsuarioSQL, [
        remetente.id_usuario,
        destinatario.id_usuario,
        destinatario.id_usuario,
        remetente.id_usuario,
      ]);

      return res.status(200).send(result);
    } else {
      const [[grupo]] = await pool.query(acharGrupoSQL, [nome_2]);

      if (!grupo) return res.status(404).send("Grupo não encontrado");

      const listarConversasGrupoSQL = `
        SELECT 
          m.id_mensagem,
          m.texto,
          m.data_envio,
          m.status,
          remetente.nome AS nome_remetente,
          remetente.id_usuario AS id_remetente
        FROM mensagem m
        JOIN usuario remetente ON remetente.id_usuario = m.fk_remetente
        WHERE m.fk_grupo = ?
        ORDER BY m.data_envio ASC
      `;

      const [result] = await pool.query(listarConversasGrupoSQL, [
        grupo.id_grupo,
      ]);

      return res.status(200).send(result);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}

export async function mandarMensagemGrupo(req, res) {
  const { nomeRemetente, nomeGrupo, texto } = req.body;
  const acharUsuarioPorNomeSQL =
    "SELECT id_usuario from usuario u join participante p on p.fk_participante = u.id_usuario join grupo g on p.fk_grupo = g.id_grupo where u.nome = ? and g.nome = ?";
  const acharGrupoPorNomeSQL = "SELECT id_grupo from grupo where nome = ?";
  const mandarMensagemGrupoSQL =
    "INSERT INTO mensagem(texto, fk_grupo, fk_remetente) values(?, ?, ?)";

  try {
    const [resultAcharUsuarioPorNome] = await pool.query(
      acharUsuarioPorNomeSQL,
      [nomeRemetente, nomeGrupo]
    );
    if (!resultAcharUsuarioPorNome[0])
      return res.status(404).send("O remetente não está no grupo");

    const [resultAcharGrupoPorNome] = await pool.query(acharGrupoPorNomeSQL, [
      nomeGrupo,
    ]);
    if (!resultAcharGrupoPorNome[0])
      return res.status(404).send("O grupo não foi encontrado");

    const [resultMandarMensagemGrupo] = await pool.query(
      mandarMensagemGrupoSQL,
      [
        texto,
        resultAcharGrupoPorNome[0].id_grupo,
        resultAcharUsuarioPorNome[0].id_usuario,
      ]
    );
    if (!resultMandarMensagemGrupo.affectedRows)
      return res.status(400).send("Erro ao tentar mandar a mensagem no grupo");

    return res.status(200).send("Mensagem enviada ao grupo com sucesso");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}

export async function excluirMensagemGrupo(req, res) {
  const { nomeAdmin, nomeGrupo, id_mensagem } = req.body;
  const acharFuncaoPorNomeSQL =
    "SELECT p.funcao from usuario u join participante p on p.fk_participante = u.id_usuario join grupo g on g.id_grupo = p.fk_grupo where u.nome = ? and g.nome = ?";
  const excluirMensagemGrupoSQL = "DELETE from mensagem where id_mensagem = ?";

  try {
    const [resultAcharFuncaoPorNome] = await pool.query(acharFuncaoPorNomeSQL, [
      nomeAdmin,
      nomeGrupo,
    ]);
    if (!resultAcharFuncaoPorNome[0])
      return res.status(404).send("O remetente não foi encontrado");

    if (resultAcharFuncaoPorNome[0].funcao != "admin")
      return res
        .status(403)
        .send("Somente administradores podem apagar mensagens");

    const [resultExcluirMensagemGrupo] = await pool.query(
      excluirMensagemGrupoSQL,
      [id_mensagem]
    );

    if (!resultExcluirMensagemGrupo)
      return res.status(400).send("Erro ao excluir a mensagem do grupo");

    return res.status(200).send("Mensagem excluída do grupo com sucesso");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}
