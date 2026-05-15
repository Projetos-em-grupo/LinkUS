import React, { useEffect, useState } from "react";
import { useAutenticador } from "./providers/useAutenticador";
import { usePostagens } from "./providers/usePostagens";
import { useConexao } from "./providers/useConexao";
import Loading from "./Loading";
import { filterPostagens } from "../utils/postagensUtils";
import PostInput from "./PostInput";
import PostagemItem from "./PostagemItem";

function Postagens({ termo }) {
  const { usuario, token } = useAutenticador();
  const { postagens, setReloadPostagens } = usePostagens();
  const { conexoesUsuario, conexoesUsuarioLoading, acharConexoesPorUsuario } =
    useConexao();

  const [postagensFiltradas, setPostagensFiltradas] = useState([]);
  const [midia, setMidia] = useState(null);
  const conexoes = conexoesUsuario ?? [];

  useEffect(() => {
    setPostagensFiltradas(filterPostagens(postagens, termo));
  }, [postagens, termo]);

  useEffect(() => {
    if (usuario) acharConexoesPorUsuario(usuario.nome);
  }, [usuario, acharConexoesPorUsuario]);

  if (!postagens || conexoesUsuarioLoading) return <Loading />;

  return (
    <div className="mt-6 flex h-full min-h-0 flex-col pr-2 md:pr-4">
      <PostInput
        usuario={usuario}
        token={token}
        midia={midia}
        setMidia={setMidia}
        setReloadPostagens={setReloadPostagens}
      />

      <ul className="flex-1 min-h-0 space-y-10 overflow-y-auto overscroll-contain pr-2">
        {postagensFiltradas?.map((postagem) =>
          postagem ? (
            <PostagemItem
              key={postagem.id_postagem}
              postagem={postagem}
              usuario={usuario}
              conexoesUsuario={conexoes}
              token={token}
              setReloadPostagens={setReloadPostagens}
            />
          ) : null
        )}
      </ul>
    </div>
  );
}

export default Postagens;
