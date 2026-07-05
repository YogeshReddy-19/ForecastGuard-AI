import axios from "axios";
import db from "../db.js";
import "dotenv/config";

export const getprediction = async(req,res)=>{
    try{
        const userid = req.user.id;
        const redisclient = req.redisclient; 
        const cachekey = "aapl_prediction";
        const cacheddata = await redisclient.get(cachekey);
        let result;
        if (cacheddata) {
            console.log("Serving prediction from Redis Cache!");
            result = JSON.parse(cacheddata);
        } else {
            console.log("Cache miss. Fetching from Python AI...");
            const fastapires = await axios.post(`${process.env.FASTAPI_URL}/predict`,{},{timeout: 9000});
            result = fastapires.data;
            await redisclient.set("aapl:baseline_price",result.current_price,{ EX: 60*60*24})
            await redisclient.setEx(cachekey, 3600, JSON.stringify(result));
        }
        await db.query(
        "INSERT INTO predictions (user_id,as_of_date,current_price,predicted_price,direction,direction_probability,reliability_score,reliability_label,models_agree,risk_level)VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
        [
            userid,
            new Date().toISOString().split("T")[0],
            result.current_price,
            result.predicted_price,
            result.direction,
            result.direction_probability,
            result.reliability_score,
            result.reliability_label,
            result.models_agree,
            result.risk_level
        ]
    );
        return res.status(201).json(result);
    }
    catch(e){
        return res.status(500).json({error:"Error getting the prediction"});
    }
};