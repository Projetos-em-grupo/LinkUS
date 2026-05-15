import React, { useEffect, useState } from "react";
import Header from "./Header";
import { Link, useNavigate } from "react-router-dom";
import { useAutenticador } from "./providers/useAutenticador";

function Entrar() {
  const { usuario, token, login } = useAutenticador();
  const navigate = useNavigate();
  const [erroLogin, setErroLogin] = useState("");
  const [tryingLogin, setTryingLogin] = useState(false);

  useEffect(() => {
    if (usuario || token) {
      navigate("/post");
    }
  }, [usuario, token, navigate]);

  return (
    <article aria-label="entrar" className="min-h-screen bg-linear-to-br from-neutral-50 to-secondary-50">
      <Header tipo="pagina-inicial" />
      <div className="flex justify-around items-center px-15 py-15 mb-10">
        <img
          src="./ilustrations/ilustracao1.png"
          alt="Ilustração de uma pessoa estudando"
          className="w-70 h-70"
        />
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setErroLogin("");
            const data = new FormData(e.target);
            const email = data.get("email");
            const senha = data.get("senha");
            setTryingLogin(true);
            const result = await login(email, senha);

            if (result.success) {
              navigate("/post");
              return;
            }
            
            if (result.status === 404) {
              setErroLogin("Usuário não foi encontrado.");
            } else {
              setErroLogin("Falha ao entrar. Verifique seu email e senha.");
            }

            setTryingLogin(false);
          }}
          className="bg-white w-120 rounded-3xl p-7 mb-7 text-neutral-950 shadow-xl border border-neutral-200"
        >
          <h2 className="text-center font-lato font-bold text-2xl">Entrar</h2>
          <p className="text-center font-poppins text-base text-neutral-400 mt-2">
            Olá novamente! Coloque as informações abaixo para entrar em sua
            conta.
          </p>
          <div className="flex flex-col items-center w-full">
            <input
              type="text"
              placeholder="email"
              name="email"
              autoComplete="email"
              className="block mt-4 w-full px-6 py-4 rounded-full border border-neutral-300 font-poppins text-sm text-neutral-800 placeholder-neutral-500 focus:outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/50 bg-neutral-50"
            />

            <input
              type="password"
              placeholder="senha"
              name="senha"
              autoComplete="current-password"
              className="block mt-4 w-full px-6 py-4 rounded-full border border-neutral-300 font-poppins text-sm text-neutral-800 placeholder-neutral-500 focus:outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/50 bg-neutral-50"
            />
          </div>
          <Link to="/cadastro" className="hover:text-cyan-600 text-center">
            <p className="text-sm font-poppins mt-4 mb-4 underline ">
              Não possui uma conta?
            </p>
          </Link>
          {erroLogin && (
            <p className="text-sm text-red-600 text-center mb-4">{erroLogin}</p>
          )}
          <button 
            disabled={tryingLogin}
            type="submit"
            className={`cursor-pointer w-full border-2 bg-linear-to-r from-cyan-500 to-cyan-600 text-white py-3 rounded-full font-poppins font-semibold text-base hover:from-cyan-600 hover:to-cyan-700 shadow-md hover:shadow-lg hover:text-white hover:border-cyan-800 transition-colors ${tryingLogin ? "opacity-50 cursor-not-allowed" : ""}`}
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
