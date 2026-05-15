import { Router } from "express";
import {
  enviarSolicitacao,
  aceitarSolicitacao,
  recusarSolicitacao,
  acharConexoes,
} from "../controllers/conexaoController.js";
import { verificarToken } from "../middlewareAutenticador.js";

const router = Router();

router.post("/enviarSolicitacao", verificarToken, enviarSolicitacao);
router.put("/aceitarSolicitacao", verificarToken, aceitarSolicitacao);
router.delete("/recusarSolicitacao", verificarToken, recusarSolicitacao);
router.get("/acharConexoes/:nome", verificarToken, acharConexoes);

export default router;
