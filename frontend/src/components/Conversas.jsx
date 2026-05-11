import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useConexao } from "./providers/useConexao";
import { useAutenticador } from "./providers/useAutenticador";
import Erro from "./Erro";

function Conversas({ conversa, setConversa, setModal }) {
  const { usuario, token } = useAutenticador();
  const [novaMensagem, setNovaMensagem] = useState(false);
  const [mensagens, setMensagens] = useState(null);
  const { acharConexoesPorUsuario, conexoesUsuario, conexoesUsuarioLoading } =
    useConexao();
  const [atualizarMensagens, setAtualizarMensagens] = useState(false);
  const [novosIntegrantes, setNovosIntegrantes] = useState([]);
  const [novoGrupo, setNovoGrupo] = useState({});
  const [modalMensagem, setModalMensagem] = useState();
  const [modalErro, setModalErro] = useState(null);

  async function criarGrupo() {
    const data = {
      email: usuario.email,
      nome: novoGrupo.nome,
      descricao: novoGrupo.descricao,
    };

    try {
      const result = await fetch("https://link-us-virid.vercel.app/_/backend/grupo/criarGrupo", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (result.status !== 201) {
        console.error("Erro ao tentar criar grupo: ", await result.text());
        return;
      }

      for (const integrante of novosIntegrantes) {
        const res = await fetch("https://link-us-virid.vercel.app/_/backend/grupo/participarGrupo", {
          method: "POST",
          body: JSON.stringify({
            nomeUsuario: integrante.nome,
            nomeGrupo: novoGrupo.nome,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status !== 200) {
          console.error(
            "Erro ao tentar adicionar participante: ",
            await res.text()
          );
        } else {
          acharConexoesPorUsuario(usuario.nome);
        }
      }

      setNovoGrupo({});
      setNovosIntegrantes([]);
      setNovaMensagem(false);
    } catch (error) {
      console.error("Erro interno do servidor: " + error);
    }
  }

  async function enviarMensagem(texto) {
    const data = {};
    data.nomeRemetente = usuario.nome;
    data.nomeDestinatario = conversa.nome;
    data.texto = texto;
    data.nomeGrupo = conversa.nome;
    if (conversa.tipo === "grupo") {
      try {
        const result = await fetch(
          "https://link-us-virid.vercel.app/_/backend/mensagem/mandarMensagemGrupo",
          {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (result.status != 200)
          console.error(
            "Erro ao tentar enviar mensagem: " + (await result.text())
          );
        else setAtualizarMensagens((val) => !val);
      } catch (error) {
        console.error("Erro interno do servidor: " + error);
      }
    } else {
      try {
        const result = await fetch(
          "https://link-us-virid.vercel.app/_/backend/mensagem/mandarMensagem",
          {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (result.status != 200)
          console.error(
            "Erro ao tentar enviar mensagem: " + (await result.text())
          );
        else setAtualizarMensagens((val) => !val);
      } catch (error) {
        console.error("Erro interno do servidor: " + error);
      }
    }
  }

  useEffect(() => {
    if (usuario) acharConexoesPorUsuario(usuario.nome);
  }, [usuario]);

  useEffect(() => {
    if (conversa) {
      async function acharMensagens() {
        const result = await fetch(
          `https://link-us-virid.vercel.app/_/backend/mensagem/listarMensagensConversa/${usuario.nome}/${conversa.nome}/${conversa.tipo}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (result.status != 200)
          console.error(
            "Erro ao achar as mensagens da conversa: " + (await result.text())
          );
        else {
          setMensagens(await result.json());
        }
      }

      acharMensagens();
    }
  }, [conversa, atualizarMensagens]);

  useEffect(() => {
    const mensagens_atuais = document.getElementById("conteudo-conversa");
    if (mensagens_atuais)
      mensagens_atuais.scrollTop = mensagens_atuais.scrollHeight;
  }, [mensagens]);

  if (modalErro)
    return <Erro mensagem={modalErro} setModalErro={setModalErro} />;

  return conversa ? (
    <div id="mensagens-atuais" onClick={() => setModalMensagem(null)} className="flex flex-col h-full max-h-125 overflow-y-auto">
      <div className="border-b border-neutral-300 pb-4 mb-4">
        <div className="flex gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              id="foto-perfil"
              src={conversa.url_foto || "./icons/padrao.svg"}
              alt="Foto de perfil da conversa"
              className="w-12 h-12 rounded-full object-cover"
            />
            <p className="font-poppins font-semibold">@{conversa.nome}</p>
          </div>
          {conversa.tipo === "grupo" && (
            <img
              src="./icons/info.svg"
              alt="Ícone de informações da conversa"
              className="cursor-pointer hover:opacity-80 transition-opacity w-6 h-6"
              onClick={() => {
                setModal(conversa);
              }}
            />
          )}
        </div>
      </div>
      <ul id="conteudo-conversa" className="flex-1 overflow-y-auto space-y-3 mb-4">
        {mensagens &&
          mensagens.map((mensagem) => {
            return (
              <li
                key={mensagem.id_mensagem}
                className={`flex ${
                  mensagem.nome_remetente === usuario.nome
                    ? "justify-end"
                    : "justify-start"
                }`}
                id={
                  mensagem.id_mensagem === modalMensagem?.id_mensagem
                    ? "modal"
                    : ""
                }
                onClick={(e) => {
                  e.stopPropagation();
                  setModalMensagem(mensagem);
                }}
              >
                <div className="relative max-w-xs">
                  {modalMensagem?.id_mensagem === mensagem.id_mensagem && (
                    <div
                      className="absolute -top-8 left-0 bg-danger flex gap-2 px-3 py-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity z-10"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (conversa.tipo === "grupo") {
                          const data = {
                            nomeAdmin: usuario.nome,
                            nomeGrupo: conversa.nome,
                            id_mensagem: mensagem.id_mensagem,
                          };

                          const res = await fetch(
                            "https://link-us-virid.vercel.app/_/backend/mensagem/excluirMensagemGrupo",
                            {
                              method: "DELETE",
                              body: JSON.stringify(data),
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                            }
                          );

                          if (res.status !== 200)
                            setModalErro(
                              "Erro ao tentar excluir a mensagem: " +
                                (await res.text())
                            );
                          else setAtualizarMensagens((val) => !val);
                        } else {
                          const data = {
                            nomeUsuario: usuario.nome,
                            nomeAmigo: conversa.nome,
                            id_mensagem: mensagem.id_mensagem,
                          };

                          const res = await fetch(
                            "https://link-us-virid.vercel.app/_/backend/mensagem/excluirMensagem",
                            {
                              method: "DELETE",
                              body: JSON.stringify(data),
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                            }
                          );

                          if (res.status !== 200)
                            setModalErro(
                              "Erro ao tentar excluir a mensagem: " +
                                (await res.text())
                            );
                          else setAtualizarMensagens((val) => !val);
                        }
                      }}
                    >
                      <img src="./icons/lixeira.svg" alt="Ícone de lixeira" className="w-4 h-4" />
                      <p className="text-xs text-white font-poppins">Excluir</p>
                    </div>
                  )}
                  <div className={`px-4 py-3 rounded-3xl ${
                    mensagem.nome_remetente === usuario.nome
                      ? "bg-primary-500 text-white rounded-br-none"
                      : "bg-neutral-200 text-neutral-900 rounded-bl-none"
                  }`}>
                    <p className="font-poppins text-sm">{mensagem.texto}</p>
                  </div>
                  <div className={`flex gap-2 mt-1 text-xs font-poppins ${
                    mensagem.nome_remetente === usuario.nome
                      ? "justify-end text-neutral-600"
                      : "justify-start text-neutral-600"
                  }`}>
                    <p>
                      {formatDistanceToNow(new Date(mensagem.data_envio), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                    {mensagem.nome_remetente === usuario.nome && (
                      <img
                        src={
                          mensagem.status === "visualizado"
                            ? "./icons/visualizado.svg"
                            : mensagem.status === "entregue"
                              ? "./icons/entregue.svg"
                              : "./icons/enviado.svg"
                        }
                        alt={`Status de visualização: ${mensagem.status}`}
                        className="w-4 h-4"
                      />
                    )}
                  </div>
                </div>
              </li>
            );
          })}
      </ul>
      <div className="flex gap-3 items-center border-t border-neutral-300 pt-4 relative">
        <input
          type="text"
          placeholder="digite uma mensagem"
          className="flex-1 bg-neutral-200 rounded-full px-4 py-3 font-poppins text-sm border-none focus:outline-none focus:ring-2 focus:ring-primary-500"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              enviarMensagem(e.target.value);
              e.target.value = "";
            }
          }}
        />
        <img
          src="./icons/enviarSolicitacao.svg"
          alt="Ícone de enviar mensagem"
          className="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity"
        />
      </div>
    </div>
  ) : (
    <div className="mt-24 flex flex-col items-center justify-center">
      <h2 className="font-lato font-semibold text-3xl mb-4">Selecione uma mensagem</h2>
      <p className="font-poppins text-base text-neutral-600 mb-6">Inicie uma nova conversa</p>
      <a 
        onClick={() => setNovaMensagem("mensagem")}
        className="px-9 py-3 bg-primary-500 text-white rounded-full font-poppins font-semibold cursor-pointer hover:bg-primary-600 transition-colors"
      >
        <p>Nova mensagem</p>
      </a>
      {novaMensagem == "mensagem" && !conexoesUsuarioLoading && (
        <div
          className="modal"
          id="modal-mensagem"
          onClick={() => setNovaMensagem(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <img
                src="./icons/fechar.svg"
                alt="Ícone de fechar aba de criar grupo"
                onClick={() => setNovaMensagem(false)}
                className="w-6 h-6 cursor-pointer"
              />
              <h2 className="font-lato font-semibold text-xl text-neutral-200">Nova mensagem</h2>
            </div>
            <ul className="space-y-3">
              <li 
                onClick={() => setNovaMensagem("grupo")}
                className="flex gap-4 items-center p-3 hover:bg-neutral-800 rounded-lg cursor-pointer transition-colors"
              >
                <img src="./icons/grupos.svg" alt="Ícone para criar grupo" className="w-6 h-6" />
                <p className="font-poppins text-neutral-200">Criar grupo</p>
              </li>
              {conexoesUsuario.map((conexao) => (
                <li
                  key={conexao.nome}
                  onClick={() => {
                    setConversa(conexao);
                  }}
                  className="flex gap-4 items-center p-3 hover:bg-neutral-800 rounded-lg cursor-pointer transition-colors"
                >
                  <img
                    src={conexao.url_foto || "./icons/padrao.svg"}
                    alt="Foto de perfil do usuário"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <p className="font-poppins text-neutral-200">@{conexao.nome}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {novaMensagem === "grupo" && (
        <div
          className="modal"
          id="modal-mensagem"
          onClick={() => setNovaMensagem(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div>
              <img
                src="./icons/fechar.svg"
                alt="Ícone de fechar aba de criar grupo"
                onClick={() => setNovaMensagem(false)}
              />
              <h2>Novo grupo</h2>
              <a
                onClick={() => {
                  if (novosIntegrantes) setNovaMensagem("grupo-detalhes");
                }}
              >
                Próximo
              </a>
            </div>
            <h2>Selecione os participantes</h2>
            <ul>
              {conexoesUsuario.map((conexao) => (
                <li
                  key={conexao.nome}
                  onClick={(e) => {
                    e.target.classList.toggle("ativo");
                    setNovosIntegrantes((prev) => (prev = [...prev, conexao]));
                  }}
                >
                  <img
                    src={conexao.url_foto || "./icons/padrao.svg"}
                    alt="Foto de perfil do usuário"
                  />
                  <p>@{conexao.nome}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {novaMensagem === "grupo-detalhes" && (
        <div
          className="modal"
          id="modal-mensagem"
          onClick={() => setNovaMensagem(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div>
              <img
                src="./icons/fechar.svg"
                alt="Ícone de fechar aba de criar grupo"
                onClick={() => setNovaMensagem(false)}
              />
              <h2>Novo grupo</h2>
              <a onClick={() => criarGrupo()}>criar grupo</a>
            </div>
            <label htmlFor="nome-grupo">
              <h2>Nome do grupo</h2>
              <input
                type="text"
                id="nome-grupo"
                onChange={(e) => {
                  novoGrupo.nome = e.target.value;
                }}
              />
            </label>
            <label htmlFor="descricao-grupo">
              <h2>Descrição do grupo</h2>
              <input
                type="text"
                id="descricao-grupo"
                onChange={(e) => {
                  novoGrupo.descricao = e.target.value;
                }}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export default Conversas;
