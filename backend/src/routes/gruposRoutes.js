import { Router } from "express";
import {
  administrarParticipante,
  criarGrupo,
  participarGrupo,
  acharGrupos,
  acharGruposPorUsuario,
  acharUsuariosPorGrupo,
} from "../controllers/grupoController.js";
import { verificarToken } from "../middlewareAutenticador.js";

const router = Router();

router.post("/criarGrupo", verificarToken, criarGrupo);
router.post("/participarGrupo", verificarToken, participarGrupo);
router.put("/administrarParticipante", verificarToken, administrarParticipante);
router.get("/acharGrupos", acharGrupos);
router.get("/acharGrupos/:nome", acharGruposPorUsuario);
router.get("/acharUsuarios/:id_grupo", acharUsuariosPorGrupo);

export default router;
