import express from "express";
import { registerUser } from "../controllers/Auth.js";
import { loginUser } from "../controllers/Auth.js";
import { logoutUser } from "../controllers/Auth.js";

const authrouter=express.Router();

authrouter.post("/register",registerUser);
authrouter.post("/login",loginUser);
authrouter.post("/logout",logoutUser);
export default authrouter;
