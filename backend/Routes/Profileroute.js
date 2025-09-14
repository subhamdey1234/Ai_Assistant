import express from 'express';
import { ProfileController } from '../controllers/ProfileController.js';
import { checkAuth } from '../middleware/checkAuth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Profile Management
router.get('/:userId', ProfileController.getProfile);
router.get('/', checkAuth, ProfileController.getMyProfile);
router.put('/', checkAuth, ProfileController.updateProfile);

// Avatar Management
router.post('/avatar',
    checkAuth,
    upload.single('avatar'),
    ProfileController.updateAvatar
);
router.delete('/avatar', checkAuth, ProfileController.removeAvatar);

// Education & Experience
router.post('/education', checkAuth, ProfileController.addEducation);
router.put('/education/:eduId', checkAuth, ProfileController.updateEducation);
router.delete('/education/:eduId', checkAuth, ProfileController.deleteEducation);

// Social Links
router.put('/social-links', checkAuth, ProfileController.updateSocialLinks);

// Profile Visibility
router.put('/privacy', checkAuth, ProfileController.updatePrivacySettings);

// Profile Search & Discovery
router.get('/search/interests', ProfileController.searchByInterests);
router.get('/search/location', ProfileController.searchByLocation);
router.get('/suggestions', checkAuth, ProfileController.getProfileSuggestions);

// Profile Statistics
router.get('/:userId/stats', ProfileController.getProfileStats);
router.get('/stats/overview', checkAuth, ProfileController.getMyProfileStats);

export default router;
