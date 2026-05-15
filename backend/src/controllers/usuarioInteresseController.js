import pool from "../db.js";

export async function criarUsuarioInteresse(req, res) {
  const body = req.body;
  const acharUsuarioSQL = "SELECT * from usuario where email = ?";
  const acharInteresseSQL = "SELECT * from interesse where nome = ?";
  const criarInteresseSQL = "INSERT INTO interesse(nome) values(?)";
  const criarUsuarioInteresseSQL =
    "INSERT INTO usuario_interesse(fk_interesse, fk_usuario) values(?, ?)";

  if (!body?.email || !body?.interesse)
    return res.status(400).send("informe todos os campos");

  try {
    const interesse = body.interesse.toUpperCase();
    const [resultAcharUsuario] = await pool.query(acharUsuarioSQL, body.email);
    if (!resultAcharUsuario[0])
      return res.status(404).send("usuario não encontrado");

    let [resultAcharInteresse] = await pool.query(acharInteresseSQL, interesse);

    if (!resultAcharInteresse[0]) {
      await pool.query(criarInteresseSQL, interesse);
      [resultAcharInteresse] = await pool.query(acharInteresseSQL, interesse);
    }

    await pool.query(criarUsuarioInteresseSQL, [
      resultAcharInteresse[0].id_interesse,
      resultAcharUsuario[0].id_usuario,
    ]);

    return res.status(201).send("Relação entre usuário e interesse criada");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}

export async function excluirUsuarioInteresse(req, res) {
  const body = req.body;
  const acharUsuarioSQL = "SELECT * from usuario where email = ?";
  const acharInteresseSQL = "SELECT * from interesse where nome = ?";
  const excluirUsuarioInteresseSQL =
    "DELETE from usuario_interesse where fk_usuario = ? and fk_interesse = ?";

  if (!body?.email || !body.interesse)
    return res.status(401).send("informe todos os campos");

  try {
    const [resultAcharUsuario] = await pool.query(acharUsuarioSQL, body.email);
    if (!resultAcharUsuario[0])
      return res.status(404).send("usuario não encontrado");
    const [resultAcharInteresse] = await pool.query(
      acharInteresseSQL,
      body.interesse.toUpperCase()
    );
    if (!resultAcharInteresse[0])
      return res.status(404).send("interesse não encontrado");

    const [resultExcluirUsuarioInteresse] = await pool.query(
      excluirUsuarioInteresseSQL,
      [resultAcharUsuario[0].id_usuario, resultAcharInteresse[0].id_interesse]
    );
    return res.status(200).send("Relação removida com sucesso");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}
