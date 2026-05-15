import { Router } from "express";
import {
  criarInteracao,
  temInteracaoPost,
  temInteracaoComentario,
  deletarInteracao,
  atualizarInteracao,
} from "../controllers/interacaoController.js";
import { verificarToken } from "../middlewareAutenticador.js";

const router = Router();

router.post("/criarInteracao", verificarToken, criarInteracao);
router.post("/temInteracaoPost", verificarToken, temInteracaoPost);
router.post("/temInteracaoComentario", verificarToken, temInteracaoComentario);
router.delete(
  "/deletarInteracao/:id_postagem/:nome/:id_comentario",
  verificarToken,
  deletarInteracao
);
router.put("/atualizarInteracao", verificarToken, atualizarInteracao);

export default router;
