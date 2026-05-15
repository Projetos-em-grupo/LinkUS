import { Router } from "express";
import {
  criarUsuarioInteresse,
  excluirUsuarioInteresse,
} from "../controllers/usuarioInteresseController.js";

const router = Router();

router.post("/", criarUsuarioInteresse);
router.delete("/", excluirUsuarioInteresse);

export default router;
