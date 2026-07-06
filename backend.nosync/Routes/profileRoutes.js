import "dotenv/config";
import {Router} from "express";
import { getprofile } from "../Controllers/profileController.js";
import jwt from "jsonwebtoken";

const router = new Router();

export const verifytoken = async(req,res,next)=>{
    const authheader = req.headers["authorization"];
    const token = authheader && authheader.split(" ")[1];
    if(!token) return res.status(401).json({ error: "no token provided" });
    try{
        req.user = jwt.verify(token,process.env.JWT_SECRET);
        next();
    }
    catch(e){
        res.status(500).json({error:"invalid token"});
    }
};

router.get("/profile",verifytoken,getprofile);

export default router;