import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.jwt_secret_key||"98ee43718a75fea86a792b14c7b9c3c1afc78ab7fb54b30d4be631741e5274eb";
if (!process.env.jwt_secret_key) {
    console.warn('Warning: jwt_secret_key not found in environment variables. Using default secret (not recommended for production).');
}


export const generateToken = async (userId) => {
    try {
        const accessToken = jwt.sign({ userId }, JWT_SECRET, { algorithm:'HS256',expiresIn: '6h' });
        return accessToken;
    } catch (err) {
        console.error('Token generation error:', err);
        throw err;
    }
};

export const verifyToken = async (token) => {
    try {
        // Normalize token: allow 'Bearer <token>' or raw token
        let raw = token;
        if (typeof raw === 'string' && raw.startsWith('Bearer ')) {
            raw = raw.slice(7);
        }
        const decoded = jwt.verify(raw, JWT_SECRET);
        return decoded;
    } catch (err) {
        console.error('Token verification error:', err);
        throw err;
    }
};

export default generateToken;