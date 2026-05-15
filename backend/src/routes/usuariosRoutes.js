import { Router } from "express";
import {
  criarUsuario,
  logarUsuario,
  acharUsuariosPorInteresse,
  acharUsuarios,
  atualizarUsuario,
} from "../controllers/usuarioController.js";
import { verificarToken } from "../middlewareAutenticador.js";

const router = Router();

router.post("/criarUsuario", criarUsuario);
router.post("/logarUsuario", logarUsuario);
router.get(
  "/acharPorInteresse/:email",
  verificarToken,
  acharUsuariosPorInteresse
);
router.get("/acharUsuarios", acharUsuarios);
router.put("/atualizarUsuario", atualizarUsuario);

export default router;
