import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/header.css";
import { useAutenticador } from "./providers/useAutenticador";
import Loading from "./Loading.jsx";

function Header({ tipo, setTermo }) {
  const navigate = useNavigate();
  const { usuario, logout } = useAutenticador();

  if (tipo === "pagina-inicial" || tipo === "cadastro")
    return (
      <header>
        <Link to="/">
          <img src="./icons/logo.svg" alt="LinkUS logo" />
        </Link>
        <div>
          <Link to="/">
            <p>Contato</p>
          </Link>
          <Link to={tipo !== "pagina-inicial" ? "/cadastro" : "/entrar"}>
            <p>{tipo !== "pagina-inicial" ? "Criar conta" : "Entrar"}</p>
          </Link>
        </div>
      </header>
    );

  if (!usuario) return <Loading />;

  return (
    <header>
      <Link to="/">
        <img src="./icons/logo.svg" alt="LinkUS logo" />
      </Link>
      <div id="input-header">
        <input
          type="text"
          placeholder="use # para interesses @ para pessoas"
          id="search"
          onChange={(e) => setTermo(e.target.value)}
        />
        <img src="./icons/pesquisa.svg" alt="Ícone de pesquisa" />
      </div>
      <div>
        <Link to="/mensagem">
          <img src="./icons/conversa.svg" alt="Ícone de conversas" />
        </Link>
        <Link to="/perfil">
          <img
            id="foto-perfil"
            src={usuario.url_foto || "./icons/perfil.svg"}
            alt="Ícone de perfil"
          />
        </Link>
        <img
          src="./icons/logout.svg"
          alt="Ícone para sair da sua conta"
          onClick={() => {
            navigate("/");
            logout();
          }}
        />
      </div>
    </header>
  );
}

export default Header;
