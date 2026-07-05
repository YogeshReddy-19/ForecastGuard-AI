import {Router} from "express";
import { getprediction } from "../Controllers/predictController.js";
import jwt from "jsonwebtoken";
import "dotenv/config";

const router = new Router();

const verify = (req, res, next) => {
    const authheader = req.headers["authorization"];
    const token = authheader && authheader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });
    try {
        req.user = jwt.verify(token,process.env.JWT_SECRET);
        next();
    } catch (e) {
        return res.status(403).json({ error: "Invalid token" });
    }
};

router.post("/predict",verify,getprediction);

export default router;