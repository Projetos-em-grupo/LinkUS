import React, { useState } from "react";
import Header from "./Header";
import { Link, useNavigate } from "react-router-dom";
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
    <article aria-label="cadastrar" className="min-h-screen bg-linear-to-br from-neutral-50 to-secondary-50">
      <Header tipo="cadastro" />
      <div className="flex flex-col lg:flex-row justify-center items-center px-4 py-10 gap-10">
        <img
          src="./ilustrations/ilustracao3.png"
          alt="Ilustração de uma pessoa anunciando"
          className="w-64 h-64 lg:w-80 lg:h-80"
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
          className="bg-white w-full max-w-md rounded-2xl p-8 shadow-xl border border-neutral-200"
        >
          <h2 className="text-center font-lato font-bold text-2xl text-neutral-800">Cadastrar</h2>
          <p className="text-center font-poppins text-base text-neutral-600 mt-2 mb-6">
            Olá! Coloque as informações abaixo para cadastrar sua conta.
          </p>
          <input
            required
            type="text"
            placeholder="nome de usuário"
            name="nome"
            className="block mt-4 w-full px-6 py-4 rounded-full border border-neutral-300 font-poppins text-sm text-neutral-800 placeholder-neutral-500 focus:outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/50 bg-neutral-50"
          />
          <div className="block mt-4 w-full">
            <DatePicker
              selected={dataNascimento}
              onChange={(date) => setDataNascimento(date)}
              placeholderText="Selecione sua data de nascimento"
              dateFormat="dd/MM/yyyy"
              id="data_nascimento"
              wrapperClassName="w-full"
              className="block w-full px-6 py-4 rounded-full border border-neutral-300 font-poppins text-sm text-neutral-800 placeholder-neutral-500 focus:outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/50 bg-neutral-50"
              maxDate={new Date()}
            />
          </div>
          <input 
            required 
            type="email" 
            placeholder="email" 
            name="email"
            className="block mt-4 w-full px-6 py-4 rounded-full border border-neutral-300 font-poppins text-sm text-neutral-800 placeholder-neutral-500 focus:outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/50 bg-neutral-50"
          />
          <input 
            required 
            type="password" 
            placeholder="senha" 
            name="senha"
            className="block mt-4 w-full px-6 py-4 rounded-full border border-neutral-300 font-poppins text-sm text-neutral-800 placeholder-neutral-500 focus:outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/50 bg-neutral-50"
          />
          <Link to="/entrar">
            <p className="text-sm font-poppins mt-4 mb-6 text-neutral-600 underline text-center block hover:text-cyan-600">
              Já possui uma conta?
            </p>
          </Link>
          <button 
            required 
            type="submit"
            className="w-full border-2 bg-linear-to-r from-cyan-500 to-cyan-600 text-white py-3 rounded-full font-poppins font-semibold text-base hover:from-cyan-600 hover:to-cyan-700 shadow-md hover:shadow-lg hover:text-white hover:border-cyan-800 transition-colors"
          >
            Cadastrar
          </button>
        </form>
        <img
          src="./ilustrations/ilustracao4.png"
          alt="Ilustração de um notebook"
          className="w-64 h-64 lg:w-80 lg:h-80"
        />
      </div>
    </article>
  );
}

export default Cadastrar;
