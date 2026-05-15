import React, { useEffect, useRef, useState } from "react";
import { useAutenticador } from "./providers/useAutenticador";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

function GrupoInfo({ grupo, setModal }) {
  const { usuario, token } = useAutenticador();
  const [atualizarGrupo, setAtualizarGrupo] = useState();
  const [participantes, setParticipantes] = useState();
  const participantesCacheRef = useRef(new Map());

  useEffect(() => {
    if (grupo) {
      const controller = new AbortController();

      async function acharParticipantes() {
        if (!atualizarGrupo && participantesCacheRef.current.has(grupo.id_grupo)) {
          setParticipantes(participantesCacheRef.current.get(grupo.id_grupo));
          return;
        }

        const res = await fetch(
          `https://link-us-virid.vercel.app/_/backend/grupo/acharUsuarios/${grupo.id_grupo}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (res.status !== 200)
          console.error(
            "Erro ao tentar achar os participantes: ",
            await res.text()
          );
        else {
          const json = await res.json();
          participantesCacheRef.current.set(grupo.id_grupo, json);
          setParticipantes(json);
        }
      }

      acharParticipantes().catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Erro ao buscar participantes do grupo:", error);
        }
      });

      return () => controller.abort();
    }
  }, [grupo, atualizarGrupo, token]);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* Header com botão de fechar */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-neutral-50">
        <h1 className="font-poppins font-semibold text-lg text-neutral-800">Informações do Grupo</h1>
        <button
          onClick={() => setModal(null)}
          className="cursor-pointer p-2 hover:bg-neutral-200 rounded-full transition-colors"
        >
          <img
            src="./icons/fechar_black.svg"
            alt="Fechar informações do grupo"
            className="w-5 h-5"
          />
        </button>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Foto e nome do grupo */}
        <div className="flex flex-col items-center text-center space-y-4">
          <img
            src={grupo.url_foto ?? "./icons/padrao.svg"}
            alt="Foto do grupo"
            className="w-20 h-20 rounded-full object-cover border-4 border-neutral-200"
          />
          <div>
            <h2 className="font-poppins font-bold text-xl text-neutral-900">@{grupo.nome}</h2>
            <p className="font-poppins text-sm text-neutral-500">
              Criado {formatDistanceToNow(new Date(grupo.data_criacao), {
                addSuffix: true,
                locale: ptBR,
              })}
            </p>
          </div>
        </div>

        {/* Descrição */}
        <div className="bg-neutral-50 rounded-xl p-4">
          <h3 className="font-poppins font-semibold text-base text-neutral-800 mb-2">Descrição do Grupo</h3>
          <p className="font-poppins text-sm text-neutral-700 leading-relaxed">{grupo.descricao}</p>
        </div>

        {/* Membros */}
        <div>
          <h3 className="font-poppins font-semibold text-base text-neutral-800 mb-4">
            Membros ({participantes ? participantes.length : 0})
          </h3>
          <ul className="space-y-3">
            {participantes &&
              participantes.map((participante) => (
                <li key={participante.nome} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={participante.url_foto ?? "./icons/padrao.svg"}
                      alt="Foto do usuário"
                      className="w-10 h-10 rounded-full object-cover border-2 border-neutral-200"
                    />
                    <div>
                      <p className="font-poppins font-medium text-sm text-neutral-900">@{participante.nome}</p>
                      <p className="font-poppins text-xs text-neutral-500">
                        {participante.funcao === "admin" ? "Administrador" : "Membro"}
                      </p>
                    </div>
                  </div>
                  {usuario && participante.funcao !== "admin" && (
                    <button
                      className="cursor-pointer px-3 py-1 bg-cyan-500 text-white text-xs font-poppins font-medium rounded-full hover:bg-cyan-600 transition-colors"
                      onClick={async () => {
                        const data = {
                          nomeUsuario: participante.nome,
                          nomeGrupo: grupo.nome,
                          emailAdmin: usuario.email,
                          funcao: "admin",
                        };

                        const res = await fetch(
                          "https://link-us-virid.vercel.app/_/backend/grupo/administrarParticipante",
                          {
                            method: "PUT",
                            body: JSON.stringify(data),
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `bearer ${token}`,
                            },
                          }
                        );

                        if (res.status !== 200)
                          console.error(
                            "Erro ao tentar atualizar função do usuário: " +
                              (await res.text())
                          );
                        else setAtualizarGrupo((val) => !val);
                      }}
                    >
                      Tornar Admin
                    </button>
                  )}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default GrupoInfo;
