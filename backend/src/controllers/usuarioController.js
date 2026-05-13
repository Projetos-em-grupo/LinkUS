import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export async function criarUsuario(req, res) {
  const usuario = req.body;
  if (
    !usuario ||
    !usuario.nome ||
    !usuario.email ||
    !usuario.senha ||
    !usuario.data_nascimento
  )
    return res.status(400).send("informe todos os  campos");
  const criarSQL =
    "INSERT INTO usuario(nome, email, senha, data_nascimento) values(?, ?, ?, ?)";
  const acharUsuarioPorNomeOuEmailSQL =
    "SELECT * from usuario where nome = ? or email = ?";

  const senhaComHash = await bcrypt.hash(usuario.senha, 8);

  try {
    const [resultAchar] = await pool.query(acharUsuarioPorNomeOuEmailSQL, [
      usuario.nome,
      usuario.email,
    ]);

    if (resultAchar[0])
      return res.status(400).send("Nome ou email já cadastrado");

    const [result] = await pool.query(criarSQL, [
      usuario.nome,
      usuario.email,
      senhaComHash,
      usuario.data_nascimento,
    ]);

    return res.status(201).send(result);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}

export async function logarUsuario(req, res) {
  const email = req.body.email;
  const senha = req.body.senha;
  const logarSQL =
    "SELECT u.id_usuario, u.nome, u.email, u.senha, u.url_foto, u.funcao, u.data_nascimento, COALESCE(JSON_AGG(i.nome) FILTER (WHERE i.nome IS NOT NULL), '[]'::json) AS interesses from usuario u left join usuario_interesse ui on ui.fk_usuario = u.id_usuario left join interesse i on ui.fk_interesse = i.id_interesse where email = ? group by u.id_usuario, u.nome, u.email, u.senha, u.url_foto, u.funcao, u.data_nascimento";

  try {
    const [result] = await pool.query(logarSQL, [email]);
    if (!result || !result.length)
      return res.status(404).send("Usuário não encontrado");
    if (!(await bcrypt.compare(senha, result[0].senha)))
      return res.status(401).send("Senha incorreta");

    const token = jwt.sign(result[0], process.env.JWT_SECRET, {
      expiresIn: "6h",
    });

    return res.status(200).send({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}

export async function acharUsuariosPorInteresse(req, res) {
  const { email } = req.params;
  const acharUsuariosPorInteresseSQL =
    "SELECT u.nome, u.url_foto, u.data_nascimento, COUNT(*) AS interesses_em_comum FROM usuario u JOIN usuario_interesse ui ON ui.fk_usuario = u.id_usuario JOIN interesse i ON i.id_interesse = ui.fk_interesse WHERE ui.fk_interesse IN (SELECT fk_interesse FROM usuario_interesse ui join usuario u on ui.fk_usuario = u.id_usuario where u.email = ?) AND u.email != ? GROUP BY u.id_usuario ORDER BY interesses_em_comum DESC";

  try {
    const [result] = await pool.query(acharUsuariosPorInteresseSQL, [
      email,
      email,
    ]);
    if (!result.length)
      return res
        .status(404)
        .send("Não há relações de interesse entre esse usuário e outros");

    return res.status(200).send(result);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}

export async function acharUsuarios(req, res) {
  const acharUsuariosSQL =
    "SELECT u.nome, u.url_foto, u.data_nascimento, COALESCE(JSON_AGG(i.nome) FILTER (WHERE i.nome IS NOT NULL), '[]'::json) as interesses from usuario u left join usuario_interesse ui on u.id_usuario = ui.fk_usuario left join interesse i on i.id_interesse = ui.fk_interesse group by u.id_usuario, u.nome, u.url_foto, u.data_nascimento";

  try {
    const [resultAcharUsuarios] = await pool.query(acharUsuariosSQL);
    if (!resultAcharUsuarios)
      return res.status(404).send("Nenhum usuário foi encontrado");
    return res.status(200).send(resultAcharUsuarios);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}

export async function atualizarUsuario(req, res) {
  const usuario = req.body;
  console.log(usuario);

  const atualizarUsuarioSQL = "UPDATE usuario set url_foto = ? where email = ?";
  const acharUsuarioSQL = "SELECT id_usuario from usuario where email = ?";
  const acharUsuarioAtualizadoSQL =
    "SELECT u.id_usuario, u.nome, u.email, u.senha, u.url_foto, u.data_nascimento, COALESCE(JSON_AGG(i.nome) FILTER (WHERE i.nome IS NOT NULL), '[]'::json) AS interesses from usuario u left join usuario_interesse ui on ui.fk_usuario = u.id_usuario left join interesse i on ui.fk_interesse = i.id_interesse where email = ? group by u.id_usuario, u.nome, u.email, u.senha, u.url_foto, u.data_nascimento";
  const apagarUsuarioInteressesSQL =
    "DELETE from usuario_interesse where fk_usuario = ?";
  const interesseJaExisteSQL =
    "SELECT id_interesse from interesse where nome = ?";
  const acharNovoInteresseSQL =
    "SELECT id_interesse from interesse where nome = ?";
  const criarInteresseSQL = "INSERT into interesse(nome) values(?)";
  const criarUsuarioInteresseSQL =
    "INSERT into usuario_interesse(fk_usuario, fk_interesse) values (?, ?)";

  try {
    const [resultAcharUsuario] = await pool.query(acharUsuarioSQL, [
      usuario.email,
    ]);

    if (!resultAcharUsuario[0])
      return res.status(404).send("Usuário não encontrado");

    await pool.query(atualizarUsuarioSQL, [usuario.url_foto, usuario.email]);
    await pool.query(apagarUsuarioInteressesSQL, [
      resultAcharUsuario[0].id_usuario,
    ]);

    for (const interesse of usuario.interesses) {
      const [resultInteresseJaExiste] = await pool.query(interesseJaExisteSQL, [
        interesse.toLowerCase(),
      ]);
      if (!resultInteresseJaExiste[0]) {
        await pool.query(criarInteresseSQL, [interesse.toLowerCase()]);
        const [resultInteresseCriado] = await pool.query(
          acharNovoInteresseSQL,
          [interesse.toLowerCase()]
        );
        console.log(resultAcharUsuario[0].id_usuario);
        console.log(resultInteresseCriado);
        await pool.query(criarUsuarioInteresseSQL, [
          resultAcharUsuario[0].id_usuario,
          resultInteresseCriado[0].id_interesse,
        ]);
      } else {
        console.log(resultAcharUsuario[0].id_usuario);
        console.log(resultInteresseJaExiste[0].id_interesse);
        await pool.query(criarUsuarioInteresseSQL, [
          resultAcharUsuario[0].id_usuario,
          resultInteresseJaExiste[0].id_interesse,
        ]);
      }
    }

    const [resultAcharUsuarioAtualizado] = await pool.query(
      acharUsuarioAtualizadoSQL,
      [usuario.email]
    );

    const token = jwt.sign(
      resultAcharUsuarioAtualizado[0],
      process.env.JWT_SECRET,
      {
        expiresIn: "6h",
      }
    );

    return res.status(200).send({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno do servidor");
  }
}
