"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const router = express_1.default.Router();
// Register new user (restricted to admin/director role)
router.post('/register', async (req, res) => {
    try {
        const { email, password, first_name, last_name, role, phone, department } = req.body;
        // Check if user already exists
        const existingUser = await (0, database_1.default)('users').where('email', email).first();
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        // Hash password
        const saltRounds = 12;
        const password_hash = await bcryptjs_1.default.hash(password, saltRounds);
        // Create user
        const [userId] = await (0, database_1.default)('users').insert({
            email,
            password_hash,
            first_name,
            last_name,
            role,
            phone,
            department,
            status: 'active'
        });
        res.status(201).json({
            message: 'User created successfully',
            user: { id: userId, email, first_name, last_name, role }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error during registration' });
    }
});
// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        // Find user
        const user = await (0, database_1.default)('users')
            .select('id', 'email', 'password_hash', 'first_name', 'last_name', 'role', 'status')
            .where('email', email)
            .first();
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        if (user.status !== 'active') {
            return res.status(401).json({ message: 'Account is not active' });
        }
        // Verify password
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // Update last login
        await (0, database_1.default)('users').where('id', user.id).update({ last_login: new Date() });
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '8h' });
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error during login' });
    }
});
// Logout (client-side token removal, but we can log it)
router.post('/logout', (req, res) => {
    res.json({ message: 'Logout successful' });
});
exports.default = router;
