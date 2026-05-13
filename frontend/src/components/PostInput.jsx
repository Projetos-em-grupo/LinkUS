import React, { useState } from "react";
import { criarPostagem } from "../utils/postagensApi";
import { uploadMedia } from "../utils/postagensUtils";

function PostInput({ usuario, token, midia, setMidia, setReloadPostagens }) {
  const [texto, setTexto] = useState("");

  async function enviarPostagem() {
    if (!texto.trim()) return;

    const info = {
      texto: texto.trim(),
      nomeAutor: usuario.nome,
    };

    try {
      if (midia) {
        const upload = await uploadMedia(midia);
        if (upload) {
          info.tipo = upload.tipo;
          info.url_midia = upload.url_midia;
        }
      }

      const result = await criarPostagem(info, token);
      if (!result.success) console.error(result.message);
      else setReloadPostagens((val) => !val);
    } catch (error) {
      console.error("Erro ao publicar postagem:", error);
    } finally {
      setMidia(null);
      setTexto("");
    }
  }

  async function handleKeyUp(e) {
    if (e.key !== "Enter") return;
    await enviarPostagem();
  }

  return (
    <div className="mb-8 rounded-[28px] border border-neutral-200 bg-linear-to-r from-white via-neutral-50 to-neutral-100/90 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="flex items-start gap-4">
        <img
          id="foto-perfil"
          src={usuario?.url_foto ?? "./icons/padrao.svg"}
          alt="Foto do usuario"
          className="h-14 w-14 shrink-0 rounded-2xl border border-white object-cover shadow-sm"
        />

        <div className="flex-1">
          <div className="group flex flex-col gap-3 rounded-3xl border border-transparent bg-white/90 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-neutral-200 transition-all duration-200 hover:ring-neutral-300 focus-within:-translate-y-0.5 focus-within:ring-2 focus-within:ring-cyan-400/60 sm:flex-row sm:items-center sm:px-4 sm:py-2">
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              type="text"
              id="novo-post-input"
              placeholder="O que você quer compartilhar?"
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm font-poppins text-slate-700 placeholder:text-slate-400 focus:outline-none"
              onKeyUp={handleKeyUp}
            />

            <input
              type="file"
              id="midia"
              accept="image/jpeg, image/png, image/gif, image/bmp, image/webp, video/mp4"
              style={{ display: "none" }}
              onChange={(e) => {
                const arquivo = e.target.files[0];
                if (!arquivo) return;
                if (arquivo.type === "video/mp4")
                  setMidia({ tipo: "video", conteudo: arquivo });
                else setMidia({ tipo: "imagem", conteudo: arquivo });
              }}
            />

            <label
              htmlFor="midia"
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-900 text-white shadow-[0_8px_20px_rgba(15,23,42,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-600"
              title="Adicionar mídia"
            >
              <img
                src="./icons/adicionar_arquivo.svg"
                alt="Adicionar midia"
                className="h-4 w-4 brightness-0 invert"
              />
            </label>

            <button
              type="button"
              onClick={enviarPostagem}
              className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-white transition hover:bg-cyan-600"
              title="Enviar postagem"
            >
              <img
                src="./icons/enviarSolicitacao.svg"
                alt="Enviar postagem"
                className="h-5 w-5 brightness-0 invert"
              />
            </button>
          </div>

          {midia && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-3xl bg-slate-50 px-3 py-2 shadow-sm ring-1 ring-slate-200">
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700 ring-1 ring-cyan-100">
                {midia.tipo === "video" ? "Vídeo anexado" : "Imagem anexada"}
              </span>
              <p className="max-w-55 truncate text-xs font-poppins text-slate-500">
                {midia.conteudo.name}
              </p>
              <button
                type="button"
                onClick={() => setMidia(null)}
                className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                title="Remover anexo"
              >
                <img
                  src="./icons/fechar_black.svg"
                  alt="Remover anexo"
                  className="h-4 w-4"
                />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostInput;
