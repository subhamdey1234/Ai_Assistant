import mongoose from "mongoose";
import { Schema } from "mongoose";

const commentSchema = new Schema({
    post: {
        type: Schema.Types.ObjectId,
        ref: 'posts',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'users'
    }],
    replies: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            required: true
        },
        content: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("comments", commentSchema);
