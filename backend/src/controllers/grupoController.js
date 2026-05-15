import pool from "../db.js";

async function acharGrupoPorNome(nome) {
  const acharGrupoPorNomeSQL = "SELECT id_grupo from grupo where nome = ?";
  const [resultAcharGrupoPorNome] = await pool.query(acharGrupoPorNomeSQL, [
    nome,
  ]);
  return resultAcharGrupoPorNome;
}

export async function criarGrupo(req, res) {
  const grupo = req.body;
  const acharUsuarioPorEmailSQL =
    "SELECT id_usuario from usuario where email = ?";
  const criarGrupoSQL =
    "INSERT INTO grupo(nome, descricao, fk_criador) values(?, ?, ?)";
  const criarAdministradorSQL =
    "INSERT INTO participante(fk_grupo, fk_participante, funcao) values(?, ?, 'admin')";

  try {
    const [resultAcharUsuario] = await pool.query(acharUsuarioPorEmailSQL, [
      grupo.email,
    ]);
    if (!resultAcharUsuario[0])
      return res.status(404).send("Usuário não encontrado");

    console.log(grupo.nome, grupo.descricao, resultAcharUsuario[0].id_usuario);

    const [resultCriarGrupo] = await pool.query(criarGrupoSQL, [
      grupo.nome,
      grupo.descricao,
      resultAcharUsuario[0].id_usuario,
    ]);

    if (!resultCriarGrupo)
      return res.status(400).send("Erro ao tentar criar o grupo");

    const resultAcharGrupoPorNome = await acharGrupoPorNome(grupo.nome);

    const [resultCriarAdministrador] = await pool.query(criarAdministradorSQL, [
      resultAcharGrupoPorNome[0].id_grupo,
      resultAcharUsuario[0].id_usuario,
    ]);

    if (!resultCriarAdministrador)
      return res.status(400).send("Erro ao criar o admnistrador");

    return res.status(201).send("Grupo criado com sucesso");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}

export async function participarGrupo(req, res) {
  const { nomeGrupo, nomeUsuario } = req.body;
  const acharUsuarioPorNomeSQL =
    "SELECT id_usuario from usuario where nome = ?";
  const participarGrupoSQL =
    "INSERT INTO participante(fk_grupo, fk_participante) values(?, ?)";

  try {
    const [resultAcharUsuario] = await pool.query(acharUsuarioPorNomeSQL, [
      nomeUsuario,
    ]);
    if (!resultAcharUsuario[0])
      return res.status(404).send("Usuário não encontrado");

    const resultAcharGrupoPorNome = await acharGrupoPorNome(nomeGrupo);
    if (!resultAcharGrupoPorNome[0])
      return res.status(404).send("Grupo não encontrado");

    const [resultParticiparGrupo] = await pool.query(participarGrupoSQL, [
      resultAcharGrupoPorNome[0].id_grupo,
      resultAcharUsuario[0].id_usuario,
    ]);

    if (!resultParticiparGrupo)
      res.status(400).send("Erro ao tentar participar do grupo");

    return res.status(200).send("Participante adicionado com sucesso");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}

export async function administrarParticipante(req, res) {
  const { nomeUsuario, nomeGrupo, emailAdmin, funcao } = req.body;
  const acharUsuarioPorNomeSQL =
    "SELECT id_usuario from usuario where nome = ?";
  const acharAdminPorEmailENomeDoGrupoSQL =
    "SELECT u.id_usuario, p.funcao from usuario u join participante p on p.fk_participante = u.id_usuario join grupo g on g.id_grupo = p.fk_grupo where u.email = ? and g.nome = ?";
  const administrarParticipanteSQL =
    "UPDATE participante set funcao = ? where fk_participante = ? and fk_grupo = ?";

  try {
    const resultAcharGrupoPorNome = await acharGrupoPorNome(nomeGrupo);
    if (!resultAcharGrupoPorNome[0])
      return res.status(404).send("Grupo não encontrado");
    const [resultAcharUsuarioPorNome] = await pool.query(
      acharUsuarioPorNomeSQL,
      [nomeUsuario]
    );

    if (!resultAcharUsuarioPorNome[0])
      return res.status(404).send("Usuário não encontrado");

    const [resultAcharAdminPorEmail] = await pool.query(
      acharAdminPorEmailENomeDoGrupoSQL,
      [emailAdmin, nomeGrupo]
    );

    if (!resultAcharAdminPorEmail[0])
      return res.status(404).send("Usuário administrador não encontrado");

    if (resultAcharAdminPorEmail[0].funcao != "admin")
      return res.status(403).send("O usuário não é um administrador");

    const [resultAdministrarParticipante] = await pool.query(
      administrarParticipanteSQL,
      [
        funcao,
        resultAcharUsuarioPorNome[0].id_usuario,
        resultAcharGrupoPorNome[0].id_grupo,
      ]
    );

    if (!resultAdministrarParticipante)
      return res
        .status(400)
        .send("Erro ao tentar mudar função do participante");

    return res.status(200).send("Função do usuário alterada");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}

export async function acharGrupos(req, res) {
  const acharGruposSQL = "SELECT nome, descricao from grupo";

  try {
    const [resultAcharGrupo] = await pool.query(acharGruposSQL);
    if (!resultAcharGrupo)
      return res.status(400).send("Erro ao tentar achar os grupos");

    return res.status(200).send(resultAcharGrupo);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}

export async function acharGruposPorUsuario(req, res) {
  const { nome } = req.params;
  const acharUsuarioPorNomeSQL =
    "SELECT id_usuario from usuario where nome = ?";
  const acharGrupoPorUsuarioSQL =
    "SELECT g.nome, g.descricao from grupo g join participante p on p.fk_grupo = g.id_grupo where p.fk_participante = ?";

  try {
    const [resultAcharUsuarioPorNome] = await pool.query(
      acharUsuarioPorNomeSQL,
      [nome]
    );
    if (!resultAcharUsuarioPorNome[0])
      return res.status(404).send("Usuário não encontrado");

    const [resultAcharGrupoPorUsuario] = await pool.query(
      acharGrupoPorUsuarioSQL,
      [resultAcharUsuarioPorNome[0].id_usuario]
    );

    if (!resultAcharGrupoPorUsuario)
      return res.status(400).send("Erro ao tentar achar os grupos do usuário");

    return res.status(200).send(resultAcharGrupoPorUsuario);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}

export async function acharUsuariosPorGrupo(req, res) {
  const { id_grupo } = req.params;
  const acharUsuarioPorGrupoSQL =
    "SELECT u.url_foto, u.nome, p.funcao from participante p join usuario u on u.id_usuario = p.fk_participante where p.fk_grupo = ?";

  try {
    const [resultAcharUsuarioPorGrupo] = await pool.query(
      acharUsuarioPorGrupoSQL,
      [id_grupo]
    );
    if (!resultAcharUsuarioPorGrupo[0])
      return res.status(404).send("Não foram encontrados os usuários fo grupo");

    return res.status(200).send(resultAcharUsuarioPorGrupo);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}
