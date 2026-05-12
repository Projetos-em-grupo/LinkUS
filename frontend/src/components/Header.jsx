import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAutenticador } from "./providers/useAutenticador";
import Loading from "./Loading.jsx";

function Header({ tipo, setTermo }) {
  const navigate = useNavigate();
  const { usuario, logout } = useAutenticador();

  if (tipo === "pagina-inicial" || tipo === "cadastro")
    return (
      <header className="flex items-center justify-between px-4 md:px-15 py-6 bg-white shadow-lg">
        <Link to="/">
          <img src="./icons/logo.svg" alt="LinkUS logo" className="h-12 w-auto" />
        </Link>
        <div className="flex gap-4 md:gap-15 items-center mr-4 md:mr-15">
          <Link to="/">
            <p className="font-lato font-normal text-lg text-black hover:text-cyan-600 transition-colors">Contato</p>
          </Link>
          <Link to={tipo === "pagina-inicial" ? "/cadastro" : "/entrar"}>
            <p className="font-lato font-normal text-lg border-2 border-cyan-600 rounded-full py-2 px-4 md:px-15 text-black hover:bg-linear-to-r hover:from-cyan-500 hover:to-cyan-600 hover:text-white hover:border-cyan-500 transition-colors">
              {tipo === "pagina-inicial" ? "Criar conta" : "Entrar"}
            </p>
          </Link>
        </div>
      </header>
    );

  if (!usuario) return <Loading />;

  return (
    <header className="flex items-center justify-between px-4 md:px-15 py-6 bg-white shadow-md border-b border-neutral-200">
      <Link to="/">
        <img src="./icons/logo.svg" alt="LinkUS logo" className="h-12 w-auto" />
      </Link>
      <div className="relative flex-1 max-w-2xl mx-4 md:mx-12">
        <input
          type="text"
          placeholder="use # para interesses @ para pessoas"
          id="search"
          onChange={(e) => setTermo(e.target.value)}
          className="w-full h-12 px-4 md:px-20 py-3 text-base font-poppins border border-neutral-300 rounded-full bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
        />
        <img 
          src="./icons/pesquisa.svg" 
          alt="Ícone de pesquisa" 
          className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-6 md:w-9 h-6 md:h-9 cursor-pointer"
        />
      </div>
      <div className="flex gap-4 md:gap-6 items-center ml-4 md:ml-6">
        <Link to="/mensagem" className="hover:opacity-80 transition-opacity p-2 rounded-full hover:bg-neutral-100 cursor-pointer">
          <img src="./icons/conversa.svg" alt="Ícone de conversas" className="w-6 md:w-9 h-6 md:h-9" />
        </Link>
        <Link to="/perfil" className="hover:opacity-80 transition-opacity p-2 rounded-full hover:bg-neutral-100 cursor-pointer">
          <img
            id="foto-perfil"
            src={usuario.url_foto || "./icons/perfil.svg"}
            alt="Ícone de perfil"
            className="w-6 md:w-9 h-6 md:h-9 rounded-full object-cover border-2 border-neutral-800"
          />
        </Link>
        <button
          onClick={() => {
            navigate("/");
            logout();
          }}
          className="hover:opacity-80 transition-opacity p-2 rounded-full hover:bg-neutral-100 cursor-pointer"
        >
          <img
            src="./icons/logout.svg"
            alt="Ícone para sair da sua conta"
            className="w-6 md:w-9 h-6 md:h-9"
          />
        </button>
      </div>
    </header>
  );
}

export default Header;
