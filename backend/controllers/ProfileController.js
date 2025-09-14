import Profile from '../models/Profile.js';

export const ProfileController = {
    // Get user profile
    async getProfile(req, res) {
        try {
            const profile = await Profile.findOne({ user: req.params.userId })
                .populate('user', ['username', 'email']);

            if (!profile) {
                return res.status(404).json({ message: 'Profile not found' });
            }

            res.json(profile);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Create or update profile
    async updateProfile(req, res) {
        try {
            const {
                fullName,
                bio,
                location,
                interests,
                education,
                socialLinks
            } = req.body;

            const profileFields = {
                user: req.user._id,
                fullName,
                bio,
                location,
                interests,
                education,
                socialLinks,
                updatedAt: Date.now()
            };

            let profile = await Profile.findOne({ user: req.user._id });

            if (profile) {
                profile = await Profile.findOneAndUpdate(
                    { user: req.user._id },
                    { $set: profileFields },
                    { new: true }
                );
            } else {
                profile = new Profile(profileFields);
                await profile.save();
            }

            res.json(profile);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Update avatar
    async updateAvatar(req, res) {
        try {
            const { avatarUrl } = req.body;
            
            const profile = await Profile.findOneAndUpdate(
                { user: req.user._id },
                { 
                    $set: { 
                        avatar: avatarUrl,
                        updatedAt: Date.now()
                    }
                },
                { new: true }
            );

            if (!profile) {
                return res.status(404).json({ message: 'Profile not found' });
            }

            res.json(profile);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

export default ProfileController;
