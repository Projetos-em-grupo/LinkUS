import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAutenticador } from "./providers/useAutenticador";
import Loading from "./Loading.jsx";

function Header({ tipo, setTermo }) {
  const navigate = useNavigate();
  const { usuario, logout } = useAutenticador();

  if (tipo === "pagina-inicial" || tipo === "cadastro")
    return (
      <header className="flex items-center justify-between bg-white px-4 py-6 shadow-lg md:px-15">
        <Link to="/">
          <img src="./icons/logo.svg" alt="LinkUS logo" className="h-12 w-auto" />
        </Link>
        <div className="mr-4 flex items-center gap-4 md:mr-15 md:gap-15">
          <Link to="/">
            <p className="font-lato text-lg font-normal text-black transition-colors hover:text-cyan-600">
              Contato
            </p>
          </Link>
          <Link to={tipo === "pagina-inicial" ? "/cadastro" : "/entrar"}>
            <p className="rounded-full border-2 border-cyan-600 px-4 py-2 font-lato text-lg font-normal text-black transition-colors hover:border-cyan-500 hover:bg-linear-to-r hover:from-cyan-500 hover:to-cyan-600 hover:text-white md:px-15">
              {tipo === "pagina-inicial" ? "Criar conta" : "Entrar"}
            </p>
          </Link>
        </div>
      </header>
    );

  if (!usuario) return <Loading />;

  return (
    <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-6 shadow-md md:px-15">
      <Link to="/">
        <img src="./icons/logo.svg" alt="LinkUS logo" className="h-12 w-auto" />
      </Link>
      <div className="mx-4 flex-1 md:mx-12">
        <label
          htmlFor="search"
          className="group relative flex h-14 items-center overflow-hidden rounded-[24px] border border-neutral-200/90 bg-linear-to-r from-white via-slate-50 to-cyan-50/70 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.45)] ring-1 ring-white transition-all duration-200 hover:border-cyan-200 focus-within:-translate-y-0.5 focus-within:border-cyan-300 focus-within:shadow-[0_20px_38px_-28px_rgba(6,182,212,0.5)] focus-within:ring-2 focus-within:ring-cyan-300/50"
        >
          <span className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 shadow-sm transition-colors group-focus-within:bg-cyan-500">
            <img
              src="./icons/pesquisa.svg"
              alt="Icone de pesquisa"
              className="h-4 w-4 brightness-0 invert"
            />
          </span>
          <input
            type="text"
            placeholder="Busque por postagens, pessoas ou hashtags"
            id="search"
            onChange={(e) => setTermo(e.target.value)}
            className="h-full min-w-0 flex-1 bg-transparent px-4 text-sm font-poppins text-slate-700 placeholder:text-slate-400 focus:outline-none md:text-base"
          />
          <div className="mr-3 hidden items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-1.5 text-[11px] font-poppins font-medium uppercase tracking-[0.12em] text-slate-500 shadow-sm md:flex">
            <span className="text-cyan-600" title="hashtags">#</span>
            <span className="text-slate-300">|</span>
            <span className="text-sky-600" title="usuários">@</span>
          </div>
        </label>
      </div>
      <div className="ml-4 flex items-center gap-4 md:ml-6 md:gap-6">
        <Link
          to="/mensagem"
          className="cursor-pointer rounded-full p-2 transition-opacity hover:bg-neutral-100 hover:opacity-80"
        >
          <img
            src="./icons/conversa.svg"
            alt="Icone de conversas"
            className="h-6 w-6 md:h-9 md:w-9"
          />
        </Link>
        <Link
          to="/perfil"
          className="cursor-pointer rounded-full p-2 transition-opacity hover:bg-neutral-100 hover:opacity-80"
        >
          <img
            id="foto-perfil"
            src={usuario.url_foto || "./icons/perfil.svg"}
            alt="Icone de perfil"
            className="h-6 w-6 rounded-full border-2 border-neutral-800 object-cover md:h-9 md:w-9"
          />
        </Link>
        <button
          onClick={() => {
            navigate("/");
            logout();
          }}
          className="cursor-pointer rounded-full p-2 transition-opacity hover:bg-neutral-100 hover:opacity-80"
        >
          <img
            src="./icons/logout.svg"
            alt="Icone para sair da sua conta"
            className="h-6 w-6 md:h-9 md:w-9"
          />
        </button>
      </div>
    </header>
  );
}

export default Header;
