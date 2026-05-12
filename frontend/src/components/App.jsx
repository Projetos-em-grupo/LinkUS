import React from "react";
import Loading from "./Loading.jsx";
import Header from "./Header.jsx";
import { useUsuarios } from "./providers/useUsuarios.jsx";

function App() {
  const { usuariosLoading } = useUsuarios();
  return usuariosLoading ? <Loading /> : <Header tipo={"cadastro"} />;
}

export default App;
