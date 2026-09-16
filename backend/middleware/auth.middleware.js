import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!decoded?.id) {
            return res.status(401).json({ message: 'Invalid token payload' });
        }

        req.user = decoded; // Attaches { id, role }
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token expired or invalid' });
    }
}