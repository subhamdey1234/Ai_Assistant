import mongoose from "mongoose";
import { Schema } from "mongoose";

const postSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    media: [{
        type: {
            type: String,
            enum: ['image', 'video', 'gif'],
            required: true
        },
        url: {
            type: String,
            required: true
        }
    }],
    hashtags: [{
        type: String,
        trim: true
    }],
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'users'
    }],
    shares: [{
        type: Schema.Types.ObjectId,
        ref: 'users'
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

// Add indexes for better search performance
postSchema.index({ hashtags: 1 });
postSchema.index({ content: 'text' });

export default mongoose.model("posts", postSchema);
