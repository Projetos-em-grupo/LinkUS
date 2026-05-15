import React from "react";
import { createRoot } from "react-dom/client";
import { UsuariosProvider } from "./components/providers/UsuariosProvider.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./components/App.jsx";
import "./css/style.css";
import Entrar from "./components/Entrar.jsx";
import Cadastrar from "./components/Cadastrar.jsx";
import Post from "./components/Post.jsx";
import Perfil from "./components/Perfil.jsx";
import Mensagens from "./components/Mensagens.jsx";
import { AutenticadorProvider } from "./components/providers/AutenticadorProvider.jsx";
import { GruposProvider } from "./components/providers/GruposProvider.jsx";
import { PostagensProvider } from "./components/providers/PostagensProvider.jsx";
import { MensagensProvider } from "./components/providers/MensagensProvider.jsx";
import { ConexoesProvider } from "./components/providers/ConexoesProvider.jsx";
import Amigos from "./components/Amigos.jsx";
import OutroUsuario from "./components/OutroUsuario.jsx";

createRoot(document.getElementById("root")).render(
  <AutenticadorProvider>
    <UsuariosProvider>
      <GruposProvider>
        <PostagensProvider>
          <MensagensProvider>
            <ConexoesProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<App />} />
                  <Route path="/entrar" element={<Entrar />} />
                  <Route path="/cadastro" element={<Cadastrar />} />
                  <Route path="/post" element={<Post />} />
                  <Route path="/perfil" element={<Perfil />} />
                  <Route path="/mensagem" element={<Mensagens />} />
                  <Route path="/amigo" element={<Amigos />} />
                  <Route path="/usuario" element={<OutroUsuario />} />
                </Routes>
              </Router>
            </ConexoesProvider>
          </MensagensProvider>
        </PostagensProvider>
      </GruposProvider>
    </UsuariosProvider>
  </AutenticadorProvider>
);
