import express from "express";
import UserController from "../controllers/UserController.js";
import { isAuth } from "../Middleware/isAuth.js";
import { uploadSingle } from "../Middleware/multer.js";
const profilerouter = express.Router();

profilerouter.get("/current",isAuth, UserController.getCurrentUser);
profilerouter.post("/update",isAuth,uploadSingle("assistantimage"),UserController.updateassistant);
profilerouter.post("/askassitant",isAuth,UserController.asktoassistant);



export default profilerouter;

