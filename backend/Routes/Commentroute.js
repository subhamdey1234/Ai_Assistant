import express from 'express';
import { CommentController } from '../controllers/CommentController.js';
import { checkAuth } from '../middleware/checkAuth.js';

const router = express.Router();

// Comment Creation & Management
router.post('/post/:postId', 
    checkAuth, 
    CommentController.createComment
);
router.get('/post/:postId', CommentController.getComments);
router.put('/:commentId', checkAuth, CommentController.updateComment);
router.delete('/:commentId', checkAuth, CommentController.deleteComment);

// Replies
router.post('/:commentId/reply', checkAuth, CommentController.addReply);
router.put('/:commentId/reply/:replyId', checkAuth, CommentController.updateReply);
router.delete('/:commentId/reply/:replyId', checkAuth, CommentController.deleteReply);
router.get('/:commentId/replies', CommentController.getReplies);

// Interactions
router.post('/:commentId/like', checkAuth, CommentController.toggleLike);
router.get('/:commentId/likes', CommentController.getCommentLikes);

// User Comments
router.get('/user/:userId', checkAuth, CommentController.getUserComments);
router.get('/my-comments', checkAuth, CommentController.getMyComments);

// Search & Filter
router.get('/search', checkAuth, CommentController.searchComments);
router.get('/recent', CommentController.getRecentComments);

export default router;
