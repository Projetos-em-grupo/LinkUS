import { Router } from "express";
import {
  mandarMensagem,
  excluirMensagem,
  atualizarStatusMensagens,
  listarConversasUsuario,
  mandarMensagemGrupo,
  excluirMensagemGrupo,
  listarMensagensConversa,
} from "../controllers/mensagemController.js";

const router = Router();

router.post("/mandarMensagem", mandarMensagem);
router.delete("/excluirMensagem", excluirMensagem);
router.put("/atualizarStatusMensagens", atualizarStatusMensagens);
router.get("/listarConversasUsuario/:email", listarConversasUsuario);
router.get(
  "/listarMensagensConversa/:nome_1/:nome_2/:tipo",
  listarMensagensConversa
);
router.post("/mandarMensagemGrupo", mandarMensagemGrupo);
router.delete("/excluirMensagemGrupo", excluirMensagemGrupo);

export default router;
