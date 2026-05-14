import { Router } from "express";
import {
  criarComentarioPostagem,
  acharComentarios,
  deletarComentario,
} from "../controllers/comentarioController.js";
import { verificarToken } from "../middlewareAutenticador.js";

const router = Router();

router.post(
  "/criarComentarioPostagem",
  verificarToken,
  criarComentarioPostagem
);
router.get("/acharComentarios/:id_postagem", acharComentarios);
router.delete("/deletarComentario/:id_comentario", verificarToken, deletarComentario);

export default router;
