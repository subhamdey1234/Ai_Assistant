import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Post from '../models/Post.js';

export const AdminController = {
    // Get all users
    async getAllUsers(req, res) {
        try {
            const users = await User.find()
                .select('-password')
                .sort({ createdAt: -1 });
            
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Deactivate user
    async deactivateUser(req, res) {
        try {
            const user = await User.findByIdAndUpdate(
                req.params.userId,
                { isActive: false },
                { new: true }
            ).select('-password');

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({ message: 'User deactivated successfully', user });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Activate user
    async activateUser(req, res) {
        try {
            const user = await User.findByIdAndUpdate(
                req.params.userId,
                { isActive: true },
                { new: true }
            ).select('-password');

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({ message: 'User activated successfully', user });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Delete user and all associated data
    async deleteUser(req, res) {
        try {
            const user = await User.findById(req.params.userId);
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Delete user's profile
            await Profile.findOneAndDelete({ user: user._id });
            
            // Delete user's posts
            await Post.deleteMany({ user: user._id });
            
            // Delete the user
            await user.remove();

            res.json({ message: 'User and all associated data deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Get system statistics
    async getStats(req, res) {
        try {
            const stats = {
                totalUsers: await User.countDocuments(),
                activeUsers: await User.countDocuments({ isActive: true }),
                totalPosts: await Post.countDocuments(),
                recentUsers: await User.find()
                    .select('-password')
                    .sort({ createdAt: -1 })
                    .limit(5),
                recentPosts: await Post.find()
                    .populate('user', ['username', 'email'])
                    .sort({ createdAt: -1 })
                    .limit(5)
            };

            res.json(stats);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

export default AdminController;
