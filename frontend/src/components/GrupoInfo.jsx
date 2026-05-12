import React, { useEffect, useState } from "react";
import { useAutenticador } from "./providers/useAutenticador";
import "../css/grupoInfo.css";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

function GrupoInfo({ grupo }) {
  const { usuario, token } = useAutenticador();
  const [atualizarGrupo, setAtualizarGrupo] = useState();
  const [participantes, setParticipantes] = useState();

  useEffect(() => {
    if (grupo) {
      async function acharParticipantes() {
        const res = await fetch(
          `https://link-us-virid.vercel.app/_/backend/grupo/acharUsuarios/${grupo.id_grupo}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `bearer ${token}`,
            },
          }
        );

        if (res.status !== 200)
          console.error(
            "Erro ao tentar achar os participantes: ",
            await res.text()
          );
        else setParticipantes(await res.json());
      }

      acharParticipantes();
    }
  }, [grupo, atualizarGrupo, token]);
  return (
    <div id="grupo-info">
      <span>
        <img src={grupo.url_foto ?? "./icons/padrao.svg"} alt="Foto do grupo" />
      </span>
      <p>{grupo.nome}</p>
      <p>
        Criado{" "}
        {formatDistanceToNow(new Date(grupo.data_criacao), {
          addSuffix: true,
          locale: ptBR,
        })}
      </p>
      <div>
        <h2>Descrição do grupo</h2>
        <p>{grupo.descricao}</p>
      </div>
      {participantes && <p>{participantes.length} membros</p>}
      <ul>
        {participantes &&
          participantes.map((participante) => {
            console.log(participante);
            return (
              <li key={participante.nome}>
                <img
                  id="foto-perfil"
                  src={participante.url_foto ?? "./icons/padrao.svg"}
                  alt="Foto do usuario"
                />
                <p>@{participante.nome}</p>
                <a
                  className={participante.funcao}
                  onClick={async () => {
                    if (participante.funcao !== "admin") {
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
                    }
                  }}
                >
                  {participante.funcao === "admin"
                    ? "admin do grupo"
                    : "membro"}
                </a>
              </li>
            );
          })}
      </ul>
    </div>
  );
}

export default GrupoInfo;
