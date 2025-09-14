import express from 'express';
import { AdminController } from '../controllers/AdminController.js';
import { UserController } from '../controllers/UserController.js';
import { checkAuth } from '../middleware/checkAuth.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

// Auth & Admin Management Routes
router.post('/register', isAdmin, AdminController.createAdmin);  // Only super_admin can create admins
router.post('/login', AdminController.login);
router.get('/profile', checkAuth, isAdmin, AdminController.getAdminProfile);
router.put('/profile', checkAuth, isAdmin, AdminController.updateAdminProfile);
router.put('/change-password', checkAuth, isAdmin, AdminController.changePassword);

// User Management Routes
router.get('/users', checkAuth, isAdmin, AdminController.getAllUsers);
router.get('/users/:userId', checkAuth, isAdmin, AdminController.getUserDetails);
router.put('/users/:userId/activate', checkAuth, isAdmin, AdminController.activateUser);
router.put('/users/:userId/deactivate', checkAuth, isAdmin, AdminController.deactivateUser);
router.delete('/users/:userId', checkAuth, isAdmin, AdminController.deleteUser);

// Content Management Routes
router.get('/posts', checkAuth, isAdmin, AdminController.getAllPosts);
router.get('/posts/:postId', checkAuth, isAdmin, AdminController.getPostDetails);
router.delete('/posts/:postId', checkAuth, isAdmin, AdminController.deletePost);
router.get('/comments', checkAuth, isAdmin, AdminController.getAllComments);
router.delete('/comments/:commentId', checkAuth, isAdmin, AdminController.deleteComment);

// Reports & Statistics Routes
router.get('/stats/overview', checkAuth, isAdmin, AdminController.getStats);
router.get('/stats/users', checkAuth, isAdmin, AdminController.getUserStats);
router.get('/stats/posts', checkAuth, isAdmin, AdminController.getPostStats);
router.get('/stats/engagement', checkAuth, isAdmin, AdminController.getEngagementStats);

// Activity Logs
router.get('/logs', checkAuth, isAdmin, AdminController.getActivityLogs);
router.get('/logs/:adminId', checkAuth, isAdmin, AdminController.getAdminActivityLogs);

// System Settings
router.get('/settings', checkAuth, isAdmin, AdminController.getSystemSettings);
router.put('/settings', checkAuth, isAdmin, AdminController.updateSystemSettings);

// Search & Filter Routes
router.get('/search/users', checkAuth, isAdmin, AdminController.searchUsers);
router.get('/search/posts', checkAuth, isAdmin, AdminController.searchPosts);
router.get('/search/comments', checkAuth, isAdmin, AdminController.searchComments);

export default router;
