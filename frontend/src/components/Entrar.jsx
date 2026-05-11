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
    <article aria-label="entrar" className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <Header tipo="cadastro" />
      <div className="flex flex-col lg:flex-row justify-center items-center px-4 py-10 gap-10">
        <img
          src="./ilustrations/ilustracao1.png"
          alt="Ilustração de uma pessoa estudando"
          className="w-64 h-64 lg:w-80 lg:h-80"
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.target);
            navigate("/post", {
              state: { email: data.get("email"), senha: data.get("senha") },
            });
          }}
          className="bg-white w-full max-w-md rounded-2xl p-8 shadow-xl border border-neutral-200"
        >
          <h2 className="text-center font-lato font-bold text-2xl text-neutral-800">Entrar</h2>
          <p className="text-center font-poppins text-base text-neutral-600 mt-2 mb-6">
            Olá novamente! Coloque as informações abaixo para entrar em sua
            conta.
          </p>
          <input
            type="text"
            placeholder="email"
            name="email"
            autoComplete="email"
            className="block mt-4 w-full px-6 py-4 rounded-full border border-neutral-300 font-poppins text-sm text-neutral-800 placeholder-neutral-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50 bg-neutral-50"
          />
          <input
            type="password"
            placeholder="senha"
            name="senha"
            autoComplete="current-password"
            className="block mt-4 w-full px-6 py-4 rounded-full border border-neutral-300 font-poppins text-sm text-neutral-800 placeholder-neutral-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50 bg-neutral-50"
          />
          <Link to="/cadastro">
            <p className="text-sm font-poppins mt-4 mb-6 text-primary-600 hover:text-primary-700 underline text-center block">
              Não possui uma conta?
            </p>
          </Link>
          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-4 rounded-full font-poppins font-semibold text-base hover:from-primary-600 hover:to-secondary-600 transition-all shadow-md hover:shadow-lg"
          >
            Entrar
          </button>
        </form>
        <img
          src="./ilustrations/ilustracao2.png"
          alt="Ilustração de uma carta"
          className="w-48 h-48 lg:w-56 lg:h-56"
        />
      </div>
    </article>
  );
}

export default Entrar;
