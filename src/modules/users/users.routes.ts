import { Router } from "express";
import {
 createUserController,
 getUserController,
 updateUserController,
 deleteUserController,
 getUsersController
} from "./users.controller";

import { validate } from "../../middlewares/validate.middleware";
import { createUserSchema } from "../../validators/user.validator";

const router = Router();

router.post(
 "/",
 validate(createUserSchema),
 createUserController
);

router.get("/", getUsersController);

router.get("/:id", getUserController);

router.patch("/:id", updateUserController);

router.delete("/:id", deleteUserController);

export default router;