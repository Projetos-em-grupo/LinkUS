import { Router } from "express";
import {
  criarPostagem,
  acharPostagens,
  acharPostagensUsuario,
} from "../controllers/postagemController.js";
import { verificarToken } from "../middlewareAutenticador.js";

const router = Router();

router.post("/criarPostagem", verificarToken, criarPostagem);
router.get("/acharPostagens", acharPostagens);
router.get("/acharPostagensUsuario/:nome", acharPostagensUsuario);

export default router;
