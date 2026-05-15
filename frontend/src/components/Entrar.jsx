import React, { useEffect } from "react";
import Header from "./Header";
import { Link, useNavigate } from "react-router-dom";
import "../css/acessar.css";
import { useAutenticador } from "./providers/useAutenticador";

function Entrar() {
  const { usuario, token } = useAutenticador();
  const navigate = useNavigate();

  useEffect(() => {
    if (usuario || token) {
      navigate("/post");
    }
  }, [usuario, token, navigate]);

  return (
    <article aria-label="entrar" id="entrar">
      <Header tipo="cadastro" />
      <div className="container acessar-div">
        <img
          src="./ilustrations/ilustracao1.png"
          alt="Ilustração de uma pessoa estudando"
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.target);
            navigate("/post", {
              state: { email: data.get("email"), senha: data.get("senha") },
            });
          }}
        >
          <h2>Entrar</h2>
          <p>
            Olá novamente! Coloque as informações abaixo para entrar em sua
            conta.
          </p>
          <input
            type="text"
            placeholder="email"
            name="email"
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="senha"
            name="senha"
            autoComplete="current-password"
          />
          <Link to="/cadastro">
            <p>Não possui uma conta?</p>
          </Link>
          <button type="submit">Entrar</button>
        </form>
        <img
          src="./ilustrations/ilustracao2.png"
          alt="Ilustração de uma carta"
        />
      </div>
    </article>
  );
}

export default Entrar;
