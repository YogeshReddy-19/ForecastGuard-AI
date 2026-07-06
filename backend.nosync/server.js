import "dotenv/config";
import express from "express";
import http from "http";
import bodyParser from "body-parser"
import session from "express-session"
import cors from "cors"
import passport from "passport";
import authRoutes from "./Routes/authRoutes.js";
import predictRoutes from "./Routes/predictRoutes.js";
import profileRoutes from "./Routes/profileRoutes.js";
import { createClient } from "redis";
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { initWebSockets } from "./web.js";


const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redisclient = createClient({
    url: redisUrl,
});
redisclient.on("error" ,(e)=>console.log("redis error",e));
await redisclient.connect();
console.log("Connected to Redis!");

const predictLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => redisclient.sendCommand(args),
    }),
    windowMs: 1 * 60 * 1000,
    max: 7,
    message: { error: "Too many predictions requested. Please wait 1 minute." },
    standardHeaders: true, 
    legacyHeaders: false,
});

const app = express();
const port = 3000;
app.set("trust proxy",1);
app.use((req, res, next) => {
    req.redisclient = redisclient;
    next();
});
const server = http.createServer(app);
initWebSockets(server, redisclient);
app.use(express.json());
app.use(cors({
    origin:["http://localhost:5173","https://forecastguardai.vercel.app"],
    credentials:true,
    allowedHeaders:["Content-Type","Authorization"],
}));
app.use(session({
    secret:process.env.SESSION_SECRET,
    saveUninitialized:true,
    resave:false,
    cookie:{secure:false},
}));
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("frontend"));
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/auth", authRoutes);
app.use("/api/predict", predictLimiter);
app.use("/api",predictRoutes);
app.use("/api",profileRoutes);
app.get("/",(req,res)=>{
    res.send("API is running");
});

server.listen(port,()=>{
    console.log(`App running on port ${port}`);
});