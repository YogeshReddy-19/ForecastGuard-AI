import "dotenv/config";
import db from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";


passport.use(
  new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,   
        clientSecret: process.env.GOOGLE_CLIENT_SECRET, 
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await db.query(
          "SELECT * FROM users WHERE google_id = $1",
          [profile.id]
        );
        if (user.rows.length > 0) {
          return done(null, user.rows[0]);
        }
        const newUser = await db.query(
          `
          INSERT INTO users
          (google_id,email,name)
          VALUES ($1,$2,$3)
          RETURNING *
          `,
          [
            profile.id,
            profile.emails?.[0]?.value,
            profile.displayName,
          ]
        );
        return done(null, newUser.rows[0]);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

const rounds = 10;

export async function login(req,res){
    const {email,password} = req.body;
    try{
        const result = await db.query("SELECT * FROM users WHERE email = $1",[email]);
        if(result.rows.length == 0){
            return res.status(401).json({error : "Invalid Credentials"});
        }
        const user = result.rows[0];
        const ismatch = await bcrypt.compare(password,user.password);
        if(!ismatch){
            return res.status(401).json({error : "Invalid Credentials"});
        }
        const token = jwt.sign(
            {id:user.id,email:user.email,name:user.name},
            process.env.JWT_SECRET,
            {expiresIn:"1h"},
        );
        return res.status(201).json({
            message:"Login Successful",
            token:token,
            user:{id:user.id,email:user.email,name:user.name},
        })
    }
    catch(e){
        console.log(e);
        return res.status(500).json({error:"Internal Server Error"});
    }
}

export const register = async(req,res)=>{
    const {email,password,name} = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "email and password are required" });
    }
    try{
        const result = await db.query("SELECT * FROM users WHERE email = $1",[email]);
        if(result.rows.length != 0){
            return res.status(401).json({error:"email already exists, try logging in"});
        }
        const passwordhash = await bcrypt.hash(password,rounds);
        const newuser = await db.query("INSERT INTO users(email,password,name) VALUES ($1,$2,$3) RETURNING id,email,name",[email,passwordhash,name]);
        return res.status(201).json({
            message: "User registered successfully",
            user: newuser.rows[0]
        });
    }
    catch(e){
        console.log(e);
        return res.status(500).json({error:"Internal Server Error"});
    }
};

export const logout = async(req,res)=>{
    req.session.destroy((err)=>{
        if(err) {
            return res.status(500).json({ error: "Could not log out" });
        }
        res.clearCookie("connect.sid");
        return res.status(201).json({message : "logout successful"});
    });
};

export const getstatus = async(req,res)=>{
    try{
        const authheader = req.headers["authorization"];
        const token = authheader && authheader.split(" ")[1];
        if(!token){
            return res.status(200).json({ loggedIn: false });
        }
        jwt.verify(token,process.env.JWT_SECRET,async(err,decodedPayload)=>{
            if (err) {
                return res.status(200).json({ loggedIn: false, error: "Session expired" });
            }
            const userquery = await db.query("SELECT id, email, name FROM users WHERE id = $1",[decodedPayload.id]);
            if(userquery.rows.length == 0){
                return res.status(201).json({loggedIn:false,error:"user record missing"});
            }
            return res.status(201).json({loggedIn:true,user:userquery.rows[0]});
        });
    }
    catch(e){
        console.log(e);
        return res.status(500).json({error:"Internal Server Error"});
    }
};