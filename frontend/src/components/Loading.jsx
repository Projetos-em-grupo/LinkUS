import React from "react";

function Loading() {
  return (
    <div className="modal" id="loading">
      <div className="modal-content">
        <h2 className="text-center font-lato font-semibold text-4xl mb-4">Carregando</h2>
        <div className="flex items-center justify-center gap-5">
          <div className="w-5 h-5 border-4 border-gray-300 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-center font-poppins font-normal text-xl">Resolvendo links bagunçados</p>
        </div>
      </div>
    </div>
  );
}

export default Loading;
