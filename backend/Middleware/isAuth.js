
import { verifyToken } from '../config/jwt.js';

export const isAuth = async (req, res, next) => {
    try {
        // Prefer Authorization header, fallback to cookie
        let token = null;
        const authHeader = req.headers.authorization;
        if (authHeader && typeof authHeader === 'string') {
            token = authHeader;
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const rawToken = (typeof token === 'string' && token.startsWith('Bearer ')) ? token.slice(7) : token;
        const verified = await verifyToken(rawToken);
        if (!verified) {
            return res.status(401).json({ message: 'Token verification failed, authorization denied' });
        }

        req.userId = verified.userId;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
};