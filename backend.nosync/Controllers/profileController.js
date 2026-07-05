import db from "../db.js";

export const getprofile = async(req,res)=>{
    try{
        const userid = req.user.id;
        const userresult = await db.query("SELECT id, email, name, created_at FROM users WHERE id = $1", [userid]);
        if (userresult.rows.length === 0) {
            return res.status(404).json({ error: "user profile not found." });
        }
        const histresult = await db.query("SELECT * FROM predictions WHERE user_id = $1 ORDER BY created_at DESC",[userid]);
        return res.status(201).json({user:userresult.rows[0],history:histresult.rows});
    }
    catch(e){
        return res.status(500).json({error:"error fetching the profile"});
    }
};