import React from "react";

function Loading() {
  return (
    <div className="modal" id="loading">
      <div className="modal-content">
        <h2 className="text-center font-lato font-semibold text-4xl mb-4 text-white">
          Carregando
        </h2>
        <div className="flex justify-center mb-6">
          <img
            src="./ilustrations/ilustracao1.png"
            alt="Ilustracao de uma pessoa estudando"
            className="w-50 h-50"
          />
        </div>
        <div className="flex items-center justify-center gap-5">
          <div className="w-5 h-5 border-4 border-gray-300 border-t-cyan-300 rounded-full animate-spin"></div>
          <p className="text-center text-white font-poppins font-normal text-xl">
            Resolvendo links bagunçados
          </p>
        </div>
      </div>
    </div>
  );
}

export default Loading;
