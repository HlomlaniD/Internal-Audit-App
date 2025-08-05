"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../config/database"));
const router = express_1.default.Router();
// Get all users (admin only)
router.get('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('director'), async (req, res) => {
    try {
        const users = await (0, database_1.default)('users')
            .select('id', 'email', 'first_name', 'last_name', 'role', 'status', 'phone', 'department', 'certifications', 'last_login', 'created_at')
            .orderBy('last_name', 'asc');
        res.json(users);
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});
// Get current user profile
router.get('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await (0, database_1.default)('users')
            .select('id', 'email', 'first_name', 'last_name', 'role', 'phone', 'department', 'certifications', 'last_login', 'created_at')
            .where('id', userId)
            .first();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
});
// Update user profile
router.put('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { first_name, last_name, phone, department, certifications } = req.body;
        await (0, database_1.default)('users')
            .where('id', userId)
            .update({
            first_name,
            last_name,
            phone,
            department,
            certifications: JSON.stringify(certifications),
            updated_at: new Date()
        });
        res.json({ message: 'Profile updated successfully' });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});
// Update user status (admin only)
router.put('/:id/status', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('director'), async (req, res) => {
    try {
        const userId = req.params.id;
        const { status } = req.body;
        if (!['active', 'inactive', 'suspended'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }
        await (0, database_1.default)('users')
            .where('id', userId)
            .update({
            status,
            updated_at: new Date()
        });
        res.json({ message: 'User status updated successfully' });
    }
    catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ message: 'Error updating user status' });
    }
});
exports.default = router;
