import { Router } from "express";
import {
  criarComentarioPostagem,
  acharComentarios,
} from "../controllers/comentarioController.js";
import { verificarToken } from "../middlewareAutenticador.js";

const router = Router();

router.post(
  "/criarComentarioPostagem",
  verificarToken,
  criarComentarioPostagem
);
router.get("/acharComentarios/:id_postagem", acharComentarios);

export default router;
