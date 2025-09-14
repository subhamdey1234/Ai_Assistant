import User from '../models/User.js';
import Profile from '../models/Profile.js';
import { verifyToken } from '../config/jwt.js';
import jwt from 'jsonwebtoken';

export const UserController = {
    // Get current user
    async getCurrentUser(req, res) {
        try {
            // Get token from Authorization header first, then cookie
            let token = null;
            const authHeader = req.headers.authorization;
            if (authHeader && typeof authHeader === 'string') {
                token = authHeader;
            } else if (req.cookies && req.cookies.token) {
                token = req.cookies.token;
            }

            if (!token) {
                return res.status(401).json({ message: "Not authorized, no token provided" });
            }

            // Normalize token (allow 'Bearer <token>' or raw token)
            const rawToken = (typeof token === 'string' && token.startsWith('Bearer ')) ? token.slice(7) : token;
            // Verify token
            const verified = await verifyToken(rawToken);
            
            if (!verified) {
                return res.status(401).json({ message: "Not authorized, token failed" });
            }

            // Get user from database
            const user = await User.findById(verified.userId).select("-password");
            
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            res.status(200).json({
                success: true,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                }
            });

        } catch (error) {
            console.error('Get current user error:', error);
            res.status(500).json({ 
                success: false, 
                message: "Error getting current user",
                error: error.message 
            });
        }
    },

    // Register new user
    async register(req, res) {
        try {
            const { username, email, password } = req.body;
            const userExists = await User.findOne({ $or: [{ email }, { username }] });
            
            if (userExists) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const user = new User({
                username,
                email,
                password // Note: In production, password should be hashed
            });

            await user.save();
            res.status(201).json({ message: 'User created successfully', userId: user._id });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Follow user
    async followUser(req, res) {
        try {
            const { userId } = req.params;
            const currentUserId = req.user._id; // Assuming middleware sets req.user

            if (userId === currentUserId.toString()) {
                return res.status(400).json({ message: "You cannot follow yourself" });
            }

            await User.findByIdAndUpdate(currentUserId, {
                $addToSet: { following: userId }
            });

            await User.findByIdAndUpdate(userId, {
                $addToSet: { followers: currentUserId }
            });

            res.json({ message: 'Successfully followed user' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Unfollow user
    async unfollowUser(req, res) {
        try {
            const { userId } = req.params;
            const currentUserId = req.user._id;

            await User.findByIdAndUpdate(currentUserId, {
                $pull: { following: userId }
            });

            await User.findByIdAndUpdate(userId, {
                $pull: { followers: currentUserId }
            });

            res.json({ message: 'Successfully unfollowed user' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Search users
    async searchUsers(req, res) {
        try {
            const { query } = req.query;
            const users = await User.find({
                $or: [
                    { username: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } }
                ]
            }).select('-password');

            res.json(users);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

export default UserController;
