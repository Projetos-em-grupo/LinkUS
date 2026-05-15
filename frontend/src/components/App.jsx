import React from "react";
import Loading from "./Loading.jsx";
import { useUsuarios } from "./providers/useUsuarios";
import { LandingPage } from "./LandingPage.jsx";
import  Header  from  "./Header.jsx";

function App() {
  const { usuarios, usuariosLoading, usuariosTrigger, setUsuariosTrigger } =
    useUsuarios();

  if (usuariosLoading) {
    return <Loading />;
  }

  return (
    <>
      <Header tipo={"pagina-inicial"} />
      <LandingPage />
    </>
  );
}


export default App;
