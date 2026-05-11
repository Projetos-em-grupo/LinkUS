import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGrupos } from "./providers/useGrupos";

function Sidebar({ ativo }) {
  const navigate = useNavigate();
  const { gruposUsuario } = useGrupos();

  console.log(gruposUsuario);
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
      <Link 
        className={`flex gap-5 items-center py-3 px-4 rounded-lg mb-2 transition-all duration-200 ${
          ativo === "home" 
            ? 'bg-primary-100 text-primary-700 shadow-sm' 
            : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 hover:text-primary-600'
        }`} 
        to="/post"
      >
        <img src="./icons/casa.svg" alt="Ícone da página inicial" className="w-6 h-6" />
        <p className="font-lato font-medium text-base">Home</p>
      </Link>
      <Link 
        className={`flex gap-5 items-center py-3 px-4 rounded-lg mb-2 transition-all duration-200 ${
          ativo === "mensagem" 
            ? 'bg-primary-100 text-primary-700 shadow-sm' 
            : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 hover:text-primary-600'
        }`} 
        to="/mensagem"
      >
        <img src="./icons/mensagem.svg" alt="Ícone da página de mensagens" className="w-6 h-6" />
        <p className="font-lato font-medium text-base">Mensagens</p>
      </Link>
      <Link 
        className={`flex gap-5 items-center py-3 px-4 rounded-lg mb-2 transition-all duration-200 ${
          ativo === "amigos" 
            ? 'bg-primary-100 text-primary-700 shadow-sm' 
            : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 hover:text-primary-600'
        }`} 
        to="/amigo"
      >
        <img src="./icons/amigos.svg" alt="Ícone da página de amizades" className="w-6 h-6" />
        <p className="font-lato font-medium text-base">Amizades</p>
      </Link>
      <div className="mt-8 pt-6 border-t border-neutral-200">
        <h2 className="font-lato font-semibold text-xl text-neutral-800 mb-4">Meus grupos</h2>
        <ul className="space-y-3">
          {gruposUsuario &&
            gruposUsuario.map((grupo, index) =>
              index > 2 ? null : (
                <li
                  key={index}
                  onClick={() => {
                    navigate("/mensagem", { state: grupo });
                  }}
                  className="flex gap-3 p-3 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors border border-transparent hover:border-neutral-200"
                >
                  <img
                    id="foto-perfil"
                    src={gruposUsuario.url_foto ?? "./icons/padrao.svg"}
                    alt="Imagem do grupo"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-lato font-medium text-sm text-neutral-800">{grupo.nome}</p>
                    <p className="font-lato font-normal text-xs text-neutral-600 mt-1">{grupo.descricao}</p>
                  </div>
                </li>
              )
            )}
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
