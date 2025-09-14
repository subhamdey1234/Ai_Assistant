import mongoose from "mongoose";
import { config } from "dotenv";
config();
export default async function connecttodb() {
  try{
  await mongoose.connect(process.env.mongo_url);
    console.log("connected to db successfully");
  }
  catch(err){
    console.log(err);
}
}


