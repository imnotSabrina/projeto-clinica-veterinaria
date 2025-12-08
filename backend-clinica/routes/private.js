import express from "express";
import { newPet, listPets, updatePet, deletePet } from "../controllers/petController.js";
import { newUser, listUsers, updateUser, deleteUser } from "../controllers/userController.js";
import { authorizaAdmin } from "../middleware/authenticate.js";

const router = express.Router();


router.get("/pets", listPets);
router.post("/pets", newPet);
router.put("/pets/:id", updatePet);
router.delete("/pets/:id", authorizaAdmin, deletePet);

router.get("/usuarios", authorizaAdmin, listUsers);
router.post("/usuarios", authorizaAdmin, newUser);
router.put("/usuarios/:id", authorizaAdmin, updateUser);
router.delete("/usuarios/:id", authorizaAdmin, deleteUser);

export default router;