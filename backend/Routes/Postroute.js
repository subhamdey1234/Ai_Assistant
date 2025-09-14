import express from 'express';
import { PostController } from '../controllers/PostController.js';
import { checkAuth } from '../middleware/checkAuth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Post Creation & Management
router.post('/', 
    checkAuth, 
    upload.array('media', 5), // Allow up to 5 media files
    PostController.createPost
);
router.get('/', PostController.getPosts);
router.get('/my-posts', checkAuth, PostController.getUserPosts);
router.get('/:postId', PostController.getPostById);
router.put('/:postId', checkAuth, PostController.updatePost);
router.delete('/:postId', checkAuth, PostController.deletePost);

// Media Handling
router.post('/:postId/media',
    checkAuth,
    upload.array('media', 5),
    PostController.addMediaToPost
);
router.delete('/:postId/media/:mediaId', checkAuth, PostController.removeMediaFromPost);

// Interactions
router.post('/:postId/like', checkAuth, PostController.toggleLike);
router.post('/:postId/share', checkAuth, PostController.sharePost);
router.get('/:postId/likes', PostController.getPostLikes);
router.get('/:postId/shares', PostController.getPostShares);

// Hashtags & Search
router.get('/hashtag/:tag', PostController.getPostsByHashtag);
router.get('/search/hashtags', PostController.searchHashtags);
router.get('/trending/hashtags', PostController.getTrendingHashtags);
router.get('/search', PostController.searchPosts);

// Feed & Discovery
router.get('/feed/following', checkAuth, PostController.getFollowingFeed);
router.get('/feed/trending', PostController.getTrendingPosts);
router.get('/feed/recommended', checkAuth, PostController.getRecommendedPosts);

// Statistics
router.get('/:postId/stats', checkAuth, PostController.getPostStats);

export default router;
