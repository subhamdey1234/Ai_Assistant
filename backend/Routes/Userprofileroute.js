import express from "express";
import UserController from "../controllers/UserController.js";
import { isAuth } from "../Middleware/isAuth.js";
const profilerouter = express.Router();

profilerouter.get("/current",isAuth, UserController.getCurrentUser);


export default profilerouter;

