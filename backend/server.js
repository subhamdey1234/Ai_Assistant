import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connecttodb from "./config/dbconnect.js";
import authrouter from "./Routes/Userroute.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import profilerouter from "./Routes/Userprofileroute.js";
import geminiResponse from "./gemini.js";


const app = express();

app.use(cors({
    origin:'https://myvirtualassistant11.netlify.app/',
    credentials:true,
}))


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());




app.use("/api/auth", authrouter);
app.use("/api/user",profilerouter);
app.get("/", async (req, res) => {
    try {
        const prompt = req.query.prompt;
        const data = await geminiResponse(prompt);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message || "Gemini API error" });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT,
    connecttodb().then(() => console.log(`Server running on port ${PORT}`)));

