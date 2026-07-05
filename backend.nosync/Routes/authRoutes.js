import {Router} from "express";
import passport from "passport";
import { login,register,logout,getstatus } from "../Controllers/authController.js";
import jwt from "jsonwebtoken";

const router = new Router();

router.post("/register",register);
router.post("/login",login);
router.post("/logout",logout);
router.get("/status",getstatus);
router.get("/google",passport.authenticate("google", {scope: ["profile", "email"],}));
router.get(
  "/google/callback",
  passport.authenticate("google", {session: false,failureRedirect: "/login",}),
  async (req, res) => {
    const token = jwt.sign(
      {id: req.user.id,email: req.user.email,name: req.user.name,},
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.redirect(
      `https://forecastguardai.vercel.app/oauth-success?token=${token}`
    );
  }
);

export default router;