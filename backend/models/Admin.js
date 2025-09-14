import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const adminSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['super_admin', 'admin'],
        default: 'admin'
    },
    permissions: [{
        type: String,
        enum: [
            'manage_users',
            'manage_posts',
            'manage_comments',
            'manage_admins',
            'view_statistics',
            'manage_reports',
            'system_settings'
        ]
    }],
    lastLogin: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        default: ''
    },
    activityLog: [{
        action: {
            type: String,
            required: true
        },
        target: {
            type: Schema.Types.ObjectId,
            refPath: 'activityLog.targetModel'
        },
        targetModel: {
            type: String,
            enum: ['users', 'posts', 'comments', 'admins']
        },
        description: String,
        timestamp: {
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
}, {
    timestamps: true
});

// Add index for better search performance
adminSchema.index({ username: 1, email: 1 });

// Pre-save middleware to update the updatedAt field
adminSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Method to check if admin has specific permission
adminSchema.methods.hasPermission = function(permission) {
    return this.permissions.includes(permission);
};

// Method to add activity log
adminSchema.methods.addActivityLog = function(action, target, targetModel, description) {
    this.activityLog.push({
        action,
        target,
        targetModel,
        description,
        timestamp: new Date()
    });
    return this.save();
};

export default mongoose.model('admins', adminSchema);