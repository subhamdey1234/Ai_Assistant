import User from '../models/User.js';
import Profile from '../models/Profile.js';
import { verifyToken } from '../config/jwt.js';
import jwt from 'jsonwebtoken';
import { uploadSingle } from '../Middleware/multer.js';
import { cloudinaryUpload } from '../config/coludinary.js';
import path from 'path';
import geminiResponse from '../gemini.js';
import moment from 'moment/moment.js';

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
                    assistantImage:user.assistantImage,
                    assistantName:user.assistantName,
                    history:user.history
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

    async updateassistant(req, res) {
        try {
            const { assistantname, imgUrl } = req.body;

            // If multer stored a file, req.file will be present
            let assistantImageValue = null;
            if (req.file) {
                // Determine file path robustly
                const filePath = req.file.path || (req.file.destination && req.file.filename ? path.join(req.file.destination, req.file.filename) : null);
                const fileType = req.file.mimetype || req.file.type;
                const fileSize = req.file.size || (req.file.size === 0 ? 0 : undefined);

                if (!filePath) {
                    console.warn('No local file path found on req.file:', req.file);
                }

                const uploadRes = await cloudinaryUpload({
                    filePath,
                    fileType,
                    fileSize,
                    folder: 'assistant_images'
                });

                if (uploadRes && typeof uploadRes === 'object') {
                    if (uploadRes.success && uploadRes.data && uploadRes.data.url) {
                        assistantImageValue = String(uploadRes.data.url);
                    } else {
                        console.warn('Cloudinary upload failed or returned invalid response:', uploadRes);
                        assistantImageValue = imgUrl || null;
                    }
                } else if (typeof uploadRes === 'string') {
                    assistantImageValue = uploadRes;
                } else {
                    assistantImageValue = imgUrl || null;
                }
            } else {
                assistantImageValue = imgUrl || null;
            }
                      const update = {};
            if (assistantname) update.assistantName = assistantname;
            if (assistantImageValue) update.assistantImage = String(assistantImageValue);

            const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('-password');

            return res.status(200).json({ message: 'Assistant updated successfully', user });
        } catch (error) {
            console.error('Update assistant error:', error);
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
    },


    async asktoassistant(req, res){
   
        try{
            const {command}=req.body;
            const user=await User.findById(req.userId);
            const username=user.name;
            const assistantname=user.assistantName;
            const response=await geminiResponse(command,assistantname,username);
            
            const jsonmatch=response.match(/{.*}/s);
            if (!jsonmatch) {
                 return res.status(500).json({
                    message:"Invalid response from assistant"
                 })
            }


            const geminires = JSON.parse(jsonmatch[0]);
            const type = geminires.type;
            const userInput = geminires.userinput || geminires.userInput;

            switch (type) {
                case 'get_date': {
                    const currentDate = moment().format('YYYY-MM-DD');
                    return res.json({ type, userInput, response: `Current date is ${currentDate}` });
                }
                case 'get_time': {
                    const currentTime = moment().format('HH:mm:ss');
                    return res.json({ type, userInput, response: `Current time is ${currentTime}` });
                }
                case 'get_day': {
                    const currentDay = moment().format('dddd');
                    return res.json({ type, userInput, response: `Today is ${currentDay}` });
                }
                case 'get_month': {
                    const currentMonth = moment().format('MMMM');
                    return res.json({ type, userInput, response: `Current month is ${currentMonth}` });
                }
                case 'general':
                case 'google_search':
                case 'youtube_search':
                case 'youtube_play':
                case 'calculator_open':
                case 'instagram_open':
                case 'facebook_open':
                case 'weather_show':
                case 'set_alarm':
                case 'set_reminder':
                case 'open_maps':
                case 'get_directions':
                case 'news_show':
                case 'play_music':
                case 'pause_music':
                case 'next_song':
                case 'previous_song':
                case 'open_whatsapp':
                case 'send_message':
                case 'make_call':
                case 'translation':
                case 'smart_home_control':
                case 'notes_create':
                case 'notes_read':
                case 'calendar_event':
                case 'timer_set':
                case 'timer_cancel':
                case 'email_send':
                case 'system_control': {
                    // For these, just echo Gemini's response field
                    return res.json({ type, userInput, response: geminires.response });
                }
                default:
                    return res.status(400).json({ message: `Unknown intent type: ${type}` });
            }

        }
        catch(error)
        {
            console.log(error);
            return res.status(500).json({message:"Assistant error occurred",
                error:error.message

            })
            
        }

    }

};

export default UserController;
