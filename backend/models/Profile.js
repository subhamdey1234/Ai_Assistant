import mongoose from "mongoose";
import { Schema } from "mongoose";

const profileSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        maxlength: 500
    },
    avatar: {
        type: String,
        default: ''
    },
    location: {
        type: String
    },
    interests: [{
        type: String
    }],
    education: [{
        school: String,
        degree: String,
        fieldOfStudy: String,
        from: Date,
        to: Date,
        current: Boolean
    }],
    socialLinks: {
        website: String,
        twitter: String,
        linkedin: String,
        github: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("profiles", profileSchema);
