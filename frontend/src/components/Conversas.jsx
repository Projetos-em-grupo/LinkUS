import React, { useEffect, useState, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useConexao } from "./providers/useConexao";
import { useAutenticador } from "./providers/useAutenticador";
import { useMensagens } from "./providers/useMensagens";
import { useGrupos } from "./providers/useGrupos";
import Erro from "./Erro";

function Conversas({ conversa, setConversa, setModal }) {
  const { usuario, token } = useAutenticador();
  const [novaMensagem, setNovaMensagem] = useState(false);
  const [mensagens, setMensagens] = useState(null);
  const { acharConexoesPorUsuario, conexoesUsuario, conexoesUsuarioLoading } =
    useConexao();
  const { mensagensUsuario } = useMensagens();
  const { acharGruposPorUsuario } = useGrupos();
  const [atualizarMensagens, setAtualizarMensagens] = useState(false);
  const [novosIntegrantes, setNovosIntegrantes] = useState([]);
  const [novoGrupo, setNovoGrupo] = useState({});
  const [modalMensagem, setModalMensagem] = useState();
  const [modalErro, setModalErro] = useState(null);
  const [podeCriarGrupo, setPodeCriarGrupo] = useState(true);
  const bottomRef = useRef(null);
  const mensagensCacheRef = useRef(new Map());

  function abrirConversaPrivada(conexao) {
    if (!conexao) return;

    const existente = mensagensUsuario?.find(
      (mensagem) => mensagem.nome === conexao.nome && mensagem.tipo === "privada"
    );

    setConversa(existente ?? { ...conexao, tipo: "privada" });
    setNovaMensagem(false);
  }

  async function criarGrupo() {
    const data = {
      email: usuario.email,
      nome: novoGrupo.nome,
      descricao: novoGrupo.descricao,
    };

    try {
      setPodeCriarGrupo(false);

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

        const resultadosParticipantes = await Promise.all(
          novosIntegrantes.map(async (integrante) => {
            const res = await fetch(
              "https://link-us-virid.vercel.app/_/backend/grupo/participarGrupo",
              {
                method: "POST",
                body: JSON.stringify({
                  nomeUsuario: integrante.nome,
                  nomeGrupo: novoGrupo.nome,
                }),
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (res.status !== 200) {
              console.error(
                "Erro ao tentar adicionar participante: ",
                await res.text()
              );
              return false;
            }

            return true;
          })
        );

        if (resultadosParticipantes.some(Boolean)) {
          await acharConexoesPorUsuario(usuario.nome, { force: true });
        }

      const grupoConversa = {
        nome: novoGrupo.nome,
        descricao: novoGrupo.descricao,
        tipo: "grupo",
      };

      setConversa(grupoConversa);
      setModal(null);
      if (acharGruposPorUsuario) acharGruposPorUsuario(usuario.nome, { force: true });
      setNovoGrupo({});
      setNovosIntegrantes([]);
      setNovaMensagem(false);
    } catch (error) {
      console.error("Erro interno do servidor: " + error);
    } finally {
      setPodeCriarGrupo(true);
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
  }, [usuario, acharConexoesPorUsuario]);

  useEffect(() => {
    if (conversa) {
      const controller = new AbortController();
      const cacheKey = `${conversa.tipo}:${conversa.nome}`;

      async function acharMensagens() {
        if (!atualizarMensagens && mensagensCacheRef.current.has(cacheKey)) {
          setMensagens(mensagensCacheRef.current.get(cacheKey));
          return;
        }

        const result = await fetch(
          `https://link-us-virid.vercel.app/_/backend/mensagem/listarMensagensConversa/${usuario.nome}/${conversa.nome}/${conversa.tipo}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (result.status != 200)
          console.error(
            "Erro ao achar as mensagens da conversa: " + (await result.text())
          );
        else {
          const json = await result.json();
          mensagensCacheRef.current.set(cacheKey, json);
          setMensagens(json);
        }
      }

      acharMensagens().catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Erro ao buscar mensagens:", error);
        }
      });

      return () => controller.abort();
    }
  }, [conversa, atualizarMensagens, token, usuario?.nome]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    } else {
      const mensagens_atuais = document.getElementById("conteudo-conversa");
      if (mensagens_atuais)
        mensagens_atuais.scrollTop = mensagens_atuais.scrollHeight;
    }
  }, [mensagens]);

  if (modalErro)
    return <Erro mensagem={modalErro} setModalErro={setModalErro} />;

  return conversa ? (
    <div className="flex flex-col h-full min-h-[70vh] bg-neutral-50 rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-white">
        <div className="flex items-center gap-3">
          <img
            src={conversa.url_foto || "./icons/padrao.svg"}
            alt="Foto de perfil da conversa"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-poppins font-semibold text-neutral-800">@{conversa.nome}</p>
            {conversa.tipo === "grupo" && (
              <p className="font-poppins text-xs text-neutral-500">Grupo</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {conversa.tipo === "grupo" && (
            <button
              onClick={() => setModal(conversa)}
              className="cursor-pointer p-2 hover:bg-neutral-200 rounded-full transition-colors"
            >
              <img
                src="./icons/info.svg"
                alt="Ícone de informações da conversa"
                className="w-5 h-5"
              />
            </button>
          )}
          <button
            onClick={() => setConversa(null)}
            className="p-2 hover:bg-neutral-200 rounded-full transition-colors"
          >
            <img
              src="./icons/fechar_black.svg"
              alt="Ícone de fechar conversa"
              className="w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity"
            />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" id="conteudo-conversa">
        {mensagens &&
          mensagens.map((mensagem) => {
            const isOwnMessage = mensagem.nome_remetente === usuario.nome;
            return (
              <div
                key={mensagem.id_mensagem}
                className={`flex w-full ${isOwnMessage ? "justify-end" : "justify-start"}`}
                id={mensagem.id_mensagem === modalMensagem?.id_mensagem ? "modal" : ""}
                onClick={(e) => {
                  e.stopPropagation();
                  setModalMensagem(mensagem);
                }}
              >
                <div className="relative w-fit max-w-[90%] md:max-w-[80%] lg:max-w-[70%]">
                  {modalMensagem?.id_mensagem === mensagem.id_mensagem && (
                    <div
                      className="absolute -top-12 left-0 bg-red-500 text-white flex gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-red-600 transition-colors z-10 shadow-lg"
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
                              "Erro ao tentar excluir a mensagem: " + (await res.text())
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
                              "Erro ao tentar excluir a mensagem: " + (await res.text())
                            );
                          else setAtualizarMensagens((val) => !val);
                        }
                      }}
                    >
                      <img src="./icons/lixeira.svg" alt="Ícone de lixeira" className="w-4 h-4" />
                      <p className="text-xs font-poppins">Excluir</p>
                    </div>
                  )}

                  <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                    isOwnMessage
                      ? "bg-cyan-500 text-white rounded-br-md border border-cyan-500/20 w-fit ml-auto px-4 py-2"
                      : "bg-neutral-200 text-neutral-950 rounded-bl-md border w-fit border-neutral-300"
                  }`}>
                    <p className="font-poppins text-sm wrap-break-word">{mensagem.texto}</p>
                  </div>

                  <div className={`flex items-center gap-2 mt-2 text-xs font-poppins ${
                    isOwnMessage ? "justify-end" : "justify-start"
                  }`}>
                    <p className="text-neutral-500">
                      {formatDistanceToNow(new Date(mensagem.data_envio), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                    {isOwnMessage && (
                      <img
                        src={
                          mensagem.status === "visualizado"
                            ? "./icons/visualizado.svg"
                            : mensagem.status === "entregue"
                              ? "./icons/entregue.svg"
                              : "./icons/enviado.svg"
                        }
                        alt={`Status: ${mensagem.status}`}
                        className="w-4 h-4"
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        <div ref={bottomRef} className="h-0 w-0" />
      </div>

      <div className="p-4 border-t border-neutral-200 bg-neutral-50">
        <div className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="Digite uma mensagem..."
            className="cursor-text flex-1 bg-neutral-100 border border-neutral-300 rounded-full px-4 py-3 font-poppins text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                enviarMensagem(e.target.value.trim());
                e.target.value = "";
              }
            }}
          />
          <button
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling;
              if (input.value.trim()) {
                enviarMensagem(input.value.trim());
                input.value = "";
              }
            }}
            className="cursor-pointer p-3 bg-cyan-500 hover:bg-cyan-600 rounded-full transition-colors shadow-md hover:shadow-lg"
          >
            <img
              src="./icons/enviarSolicitacao.svg"
              alt="Ícone de enviar mensagem"
              className="w-5 h-5"
            />
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-full bg-neutral-50 rounded-2xl p-8">
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <img src="./icons/mensagem.svg" alt="Ícone de mensagem" className="w-12 h-12" />
        </div>
        <h2 className="font-lato font-semibold text-2xl text-neutral-800 mb-3">
          Nenhuma conversa selecionada
        </h2>
        <p className="font-poppins text-neutral-600 max-w-sm">
          Escolha uma conversa existente ou inicie uma nova para começar a conversar
        </p>
      </div>

      <button
        onClick={() => setNovaMensagem("mensagem")}
        className="cursor-pointer px-8 py-4 bg-cyan-500 text-white rounded-full font-poppins font-semibold hover:bg-cyan-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3"
      >
        <img src="./icons/mais.svg" alt="Ícone de adicionar" className="w-6 h-6" />
        <span>Nova Conversa</span>
      </button>
      {novaMensagem == "mensagem" && !conexoesUsuarioLoading && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setNovaMensagem(false)}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-lato font-semibold text-xl text-neutral-800">Nova Conversa</h2>
              <img
                src="./icons/fechar_black.svg"
                alt="Ícone de fechar"
                onClick={() => setNovaMensagem(false)}
                className="w-6 h-6 cursor-pointer hover:opacity-70 transition-opacity"
              />
            </div>

            <div className="space-y-2">
              <div
                onClick={() => setNovaMensagem("grupo")}
                className="flex items-center gap-4 p-4 hover:bg-neutral-50 rounded-lg cursor-pointer transition-colors group"
              >
                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
                  <img src="./icons/grupos.svg" alt="Ícone para criar grupo" className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-poppins font-medium text-neutral-800">Criar grupo</p>
                  <p className="font-poppins text-sm text-neutral-500">Inicie uma conversa em grupo</p>
                </div>
              </div>

              {conexoesUsuario.map((conexao) => (
                <div
                  key={conexao.nome}
                  onClick={() => {
                    abrirConversaPrivada(conexao);
                  }}
                  className="flex items-center gap-4 p-4 hover:bg-neutral-50 rounded-lg cursor-pointer transition-colors"
                >
                  <img
                    src={conexao.url_foto || "./icons/padrao.svg"}
                    alt="Foto de perfil do usuário"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-poppins font-medium text-neutral-800">@{conexao.nome}</p>
                    <p className="font-poppins text-sm text-neutral-500">Iniciar conversa privada</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {novaMensagem === "grupo" && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setNovaMensagem(false)}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-lato font-semibold text-xl text-neutral-800">Novo Grupo</h2>
              <img
                src="./icons/fechar.svg"
                alt="Ícone de fechar"
                onClick={() => setNovaMensagem(false)}
                className="w-6 h-6 cursor-pointer hover:opacity-70 transition-opacity"
              />
            </div>

            <div className="mb-6">
              <h3 className="font-poppins font-medium text-lg text-neutral-700 mb-4">Selecione os participantes</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {conexoesUsuario.map((conexao) => (
                  <div
                    key={conexao.nome}
                    onClick={() => {
                      setNovosIntegrantes((prev) => {
                        const isSelected = prev.some((p) => p.nome === conexao.nome);
                        if (isSelected) {
                          return prev.filter((p) => p.nome !== conexao.nome);
                        } else {
                          return [...prev, conexao];
                        }
                      });
                    }}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      novosIntegrantes.some((p) => p.nome === conexao.nome)
                        ? "bg-cyan-50 border-2 border-cyan-200"
                        : "hover:bg-neutral-50 border-2 border-transparent"
                    }`}
                  >
                    <img
                      src={conexao.url_foto || "./icons/padrao.svg"}
                      alt="Foto de perfil do usuário"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-poppins font-medium text-neutral-800">@{conexao.nome}</p>
                    </div>
                    {novosIntegrantes.some((p) => p.nome === conexao.nome) && (
                      <div className="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                        <img src="./icons/check.svg" alt="Selecionado" className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setNovaMensagem(false)}
                className="flex-1 px-4 py-3 bg-neutral-200 text-neutral-700 rounded-lg font-poppins font-medium hover:bg-neutral-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (novosIntegrantes.length > 0) {
                    setNovaMensagem("grupo-detalhes");
                  }
                }}
                disabled={novosIntegrantes.length === 0}
                className={`flex-1 px-4 py-3 rounded-lg font-poppins font-medium transition-colors ${
                  novosIntegrantes.length > 0
                    ? "bg-cyan-500 text-white hover:bg-cyan-600"
                    : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                }`}
              >
                Próximo ({novosIntegrantes.length})
              </button>
            </div>
          </div>
        </div>
      )}
      {novaMensagem === "grupo-detalhes" && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setNovaMensagem(false)}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-lato font-semibold text-xl text-neutral-800">Detalhes do Grupo</h2>
              <img
                src="./icons/fechar.svg"
                alt="Ícone de fechar"
                onClick={() => setNovaMensagem(false)}
                className="w-6 h-6 cursor-pointer hover:opacity-70 transition-opacity"
              />
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="nome-grupo" className="block font-poppins font-medium text-sm text-neutral-700 mb-2">
                  Nome do grupo *
                </label>
                <input
                  type="text"
                  id="nome-grupo"
                  value={novoGrupo.nome || ""}
                  onChange={(e) => {
                    setNovoGrupo((prev) => ({ ...prev, nome: e.target.value }));
                  }}
                  placeholder="Digite o nome do grupo"
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg font-poppins text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label htmlFor="descricao-grupo" className="block font-poppins font-medium text-sm text-neutral-700 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  id="descricao-grupo"
                  value={novoGrupo.descricao || ""}
                  onChange={(e) => {
                    setNovoGrupo((prev) => ({ ...prev, descricao: e.target.value }));
                  }}
                  placeholder="Digite uma descrição para o grupo"
                  rows={3}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg font-poppins text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors resize-none"
                />
              </div>

              <div className="bg-neutral-50 rounded-lg p-3">
                <p className="font-poppins text-sm text-neutral-600">
                  <span className="font-medium">Participantes selecionados:</span> {novosIntegrantes.length}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setNovaMensagem("grupo")}
                className="flex-1 px-4 py-3 bg-neutral-200 text-neutral-700 rounded-lg font-poppins font-medium hover:bg-neutral-300 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={() => {
                  if (novoGrupo.nome?.trim()) {
                    criarGrupo();
                  }
                }}
                disabled={!novoGrupo.nome?.trim() || !podeCriarGrupo}
                className={`flex-1 px-4 py-3 rounded-lg font-poppins font-medium transition-colors ${
                  novoGrupo.nome?.trim() && podeCriarGrupo
                    ? "bg-cyan-500 text-white hover:bg-cyan-600 cursor-pointer"
                    : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                }`}
              >
                Criar Grupo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Conversas;
