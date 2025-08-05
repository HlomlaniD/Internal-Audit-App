import express from 'express';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';
import db from '../config/database';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, authorizeRoles('director'), async (req: AuthenticatedRequest, res) => {
  try {
    const users = await db('users')
      .select('id', 'email', 'first_name', 'last_name', 'role', 'status', 'phone', 'department', 'certifications', 'last_login', 'created_at')
      .orderBy('last_name', 'asc');

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;

    const user = await db('users')
      .select('id', 'email', 'first_name', 'last_name', 'role', 'phone', 'department', 'certifications', 'last_login', 'created_at')
      .where('id', userId)
      .first();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { first_name, last_name, phone, department, certifications } = req.body;

    await db('users')
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
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Update user status (admin only)
router.put('/:id/status', authenticateToken, authorizeRoles('director'), async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    await db('users')
      .where('id', userId)
      .update({
        status,
        updated_at: new Date()
      });

    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Error updating user status' });
  }
});

export default router;