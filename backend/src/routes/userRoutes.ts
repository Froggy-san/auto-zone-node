import express from "express";
import {
  isLoggedIn,
  login,
  logout,
  signup,
} from "../controllers/authController";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/getCurrentUser", isLoggedIn);
export default router;
