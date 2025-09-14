import User from "../models/User.js";
import { generateToken } from '../config/jwt.js';
import bcrypt from 'bcryptjs';
import cookieParser from "cookie-parser";

export const registerUser = async (req, res) => {
    try {
        console.log('Request body:', req.body); // Debug log
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                message: "User Already Exists"
            });
        }

        if (password.length < 8 || !password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        // Save the user first
        await newUser.save();


        res.status(201).json({
            message: "User Registered Successfully",
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "User Does Not Exist"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid Credentials"
            });
        }

        const accessToken = await generateToken(user._id);
        const token = `Bearer ${accessToken}`;

        // Set token in both cookie and response
        res.cookie("token", token, {
            httpOnly: true,
            expires: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
            secure: false,
            sameSite: 'lax',  // Changed to 'lax' for better browser compatibility
            path: '/'  // Ensure cookie is available for all paths
        });

        return res.status(200).json({
            success: true,
            message: 'Login Successful',
            token: token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const logoutUser = async (req, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({ message: "Logout Successful" });
    } catch (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
