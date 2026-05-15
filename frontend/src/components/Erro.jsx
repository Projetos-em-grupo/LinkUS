import React from "react";

function Erro({ mensagem, setModalErro }) {
  setTimeout(() => {
    setModalErro(null);
  }, 4000);

  return (
    <div className="modal" id="temporario" onClick={() => setModalErro(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <p>{mensagem}</p>
        <div className="barra-progresso"></div>
      </div>
    </div>
  );
}

export default Erro;
