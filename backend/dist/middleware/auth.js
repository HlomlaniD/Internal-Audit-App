"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        // Get user from database to ensure they still exist and are active
        const user = await (0, database_1.default)('users')
            .select('id', 'email', 'role', 'first_name', 'last_name', 'status')
            .where('id', decoded.userId)
            .first();
        if (!user || user.status !== 'active') {
            return res.status(401).json({ message: 'Invalid or inactive user' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};
exports.authenticateToken = authenticateToken;
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Insufficient permissions for this resource',
                required_roles: allowedRoles,
                user_role: req.user.role
            });
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
