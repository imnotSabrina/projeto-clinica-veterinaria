import express from "express";
import {newUser,validateUser, checkSystemStatus} from "../controllers/userController.js"

const router = express.Router();

router.post("/cadastro", newUser);
router.post("/login", validateUser);
router.get("/system-status", checkSystemStatus);

export default router; 