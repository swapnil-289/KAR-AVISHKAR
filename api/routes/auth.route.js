import express from "express";

import {
  signin,
  signup,
  google,
  signout,
} from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/sign-up", signup);
router.post("/sign-in", signin);
router.post("/google", google);
router.post("/signout", signout);
export default router;
