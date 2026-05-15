import React, { useState } from "react";
import Header from "./Header";
import { Link, useNavigate } from "react-router-dom";
import "../css/acessar.css";
import { useAutenticador } from "./providers/useAutenticador";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Cadastrar() {
  const { usuario, token } = useAutenticador();
  const [dataNascimento, setDataNascimento] = useState();
  const navigate = useNavigate();

  if (usuario || token) {
    navigate("/post");
    return null;
  }

  return (
    <article aria-label="cadastrar" id="cadastrar">
      <Header tipo="pagina-inicial" />
      <div className="container acessar-div">
        <img
          src="./ilustrations/ilustracao3.png"
          alt="Ilustração de uma pessoa anunciando"
        />
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const data = new FormData(e.target);
            const dados = {
              nome: data.get("nome"),
              email: data.get("email"),
              senha: data.get("senha"),
              data_nascimento: dataNascimento?.toISOString().split("T")[0],
            };

            console.log(dados);
            try {
              const result = await fetch(
                "https://link-us-virid.vercel.app/_/backend/usuario/criarUsuario",
                {
                  method: "POST",
                  body: JSON.stringify(dados),
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );

              if (result.status !== 201)
                return console.log(
                  "Erro ao cadastrar: " + (await result.text())
                );

              navigate("/post", {
                state: { email: data.get("email"), senha: data.get("senha") },
              });
            } catch (error) {
              console.log(error);
            }
          }}
        >
          <h2>Cadastrar</h2>
          <p>Olá! Coloque as informações abaixo para cadastrar sua conta.</p>
          <input
            required
            type="text"
            placeholder="nome de usuário"
            name="nome"
          />
          <DatePicker
            selected={dataNascimento}
            onChange={(date) => setDataNascimento(date)}
            placeholderText="Selecione sua data de nascimento"
            dateFormat="dd/MM/yyyy"
            className="input-date"
            maxDate={new Date()}
          />
          <input required type="email" placeholder="email" name="email" />
          <input required type="password" placeholder="senha" name="senha" />
          <Link to="/entrar">
            <p>Já possui uma conta?</p>
          </Link>
          <button required type="submit">
            Cadastrar
          </button>
        </form>
        <img
          src="./ilustrations/ilustracao4.png"
          alt="Ilustração de um notebook"
        />
      </div>
    </article>
  );
}

export default Cadastrar;
