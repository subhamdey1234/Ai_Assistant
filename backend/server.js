import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connecttodb from "./config/dbconnect.js";
import authrouter from "./Routes/Userroute.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import profilerouter from "./Routes/Userprofileroute.js";


const app = express();

app.use(cors({
    origin:'http://localhost:5173',
    credentials:true,
}))


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());




app.use("/api/auth", authrouter);
app.use("/api/user",profilerouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT,
    connecttodb().then(() => console.log(`Server running on port ${PORT}`)));

