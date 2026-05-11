import React, { useEffect } from "react";
import Header from "./Header";
import { Link, useNavigate } from "react-router-dom";
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
    <article aria-label="entrar" className="min-h-screen bg-neutral-50">
      <Header tipo="pagina-inicial" />
      <div className="flex justify-around items-center px-15 py-15 mb-10">
        <img
          src="./ilustrations/ilustracao1.png"
          alt="Ilustração de uma pessoa estudando"
          className="w-70 h-70"
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.target);
            navigate("/post", {
              state: { email: data.get("email"), senha: data.get("senha") },
            });
          }}
          className="bg-neutral-200 w-120 rounded-3xl p-7 mb-7 text-neutral-950"
        >
          <h2 className="text-center font-lato font-bold text-2xl">Entrar</h2>
          <p className="text-center font-poppins text-base text-neutral-400 mt-2">
            Olá novamente! Coloque as informações abaixo para entrar em sua
            conta.
          </p>
          <div className="flex flex-col items-center">
            <input
              type="text"
              placeholder="email"
              name="email"
              autoComplete="email"
              className="mt-4 w-72 bg-neutral-100 px-7 py-4 rounded-full border-2 border-neutral-100 font-poppins text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50"
            />

            <input
              type="password"
              placeholder="senha"
              name="senha"
              autoComplete="current-password"
              className="mt-4 w-72 bg-neutral-100 px-7 py-4 rounded-full border-2 border-neutral-100 font-poppins text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
          <Link to="/cadastro" className="hover:text-cyan-600 text-center">
            <p className="text-sm font-poppins mt-4 mb-4 underline ">
              Não possui uma conta?
            </p>
          </Link>
          <button 
            type="submit"
            className="w-full border-2 bg-linear-to-r from-cyan-500 to-cyan-600 text-white py-3 rounded-full font-poppins font-semibold text-base hover:from-cyan-600 hover:to-cyan-700 shadow-md hover:shadow-lg hover:text-white hover:border-cyan-500 transition-colors"
          >
            Entrar
          </button>
        </form>
        <img
          src="./ilustrations/ilustracao2.png"
          alt="Ilustração de uma carta"
          className="w-45 h-45"
        />
      </div>
    </article>
  );
}

export default Entrar;
