import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new Schema({
    name:{
        type:String,
        required:true    
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
   
    assistantImage:{
    type:String,

},
    assistantName:{
        type:String
    },

   history:[
    {type:String}
   ],





},{timestamps:true});


export default mongoose.model("User",userSchema);