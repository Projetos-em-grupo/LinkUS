import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://uryeqjptemdyznogbeus.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyeWVxanB0ZW1keXpub2diZXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMDI4OTcsImV4cCI6MjA2NDg3ODg5N30.h-xARu8XNys8En6VbKaH_hiBO-oBRPOzUxkgSh3dOPw";

export function formatPostDate(dateString) {
  return formatDistanceToNow(new Date(dateString), {
    addSuffix: true,
    locale: ptBR,
  });
}

export function filterPostagens(postagens = [], termo = "") {
  const lowerTermo = termo?.toLowerCase?.() ?? "";
  const prefix = termo?.charAt(0);
  const searchTerm = termo?.substring(1)?.toLowerCase() ?? "";

  const validPostagens = postagens.filter((p) => p && typeof p === "object");

  if (!termo || (prefix !== "#" && prefix !== "@")) {
    return validPostagens.filter((postagem) =>
      postagem.texto?.toLowerCase().includes(lowerTermo)
    );
  }

  if (prefix === "@") {
    return validPostagens.filter((postagem) =>
      postagem.nome?.toLowerCase().includes(searchTerm)
    );
  }

  return validPostagens.filter((postagem) =>
    postagem.interesses?.some((interesse) =>
      interesse.toLowerCase().includes(searchTerm)
    )
  );
}

export function normalizeFilename(filename = "") {
  return filename
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.]/g, "-")
    .toLowerCase();
}

export async function uploadMedia(midia) {
  if (!midia) return null;

  if (midia.tipo === "imagem") {
    const formData = new FormData();
    formData.append("image", midia.conteudo);
    formData.append("key", "02649a0bafaed4123cfcc89e63003b10");

    const res = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return { tipo: midia.tipo, url_midia: data.data.url };
  }

  if (midia.tipo === "video") {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const path = `videos/${Date.now()}-${normalizeFilename(midia.conteudo.name)}`;
    const { data, error } = await supabase.storage
      .from("linkus")
      .upload(path, midia.conteudo);

    if (error) throw error;

    return {
      tipo: midia.tipo,
      url_midia: `https://uryeqjptemdyznogbeus.supabase.co/storage/v1/object/public/linkus/${data.path}`,
    };
  }

  return null;
}
