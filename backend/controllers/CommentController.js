import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

export const CommentController = {
    // Create a comment
    async createComment(req, res) {
        try {
            const { content } = req.body;
            const { postId } = req.params;

            const post = await Post.findById(postId);
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            const comment = new Comment({
                post: postId,
                user: req.user._id,
                content
            });

            await comment.save();
            
            const populatedComment = await Comment.findById(comment._id)
                .populate('user', ['username', 'email']);

            res.status(201).json(populatedComment);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Add reply to comment
    async addReply(req, res) {
        try {
            const { content } = req.body;
            const { commentId } = req.params;

            const comment = await Comment.findById(commentId);
            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }

            comment.replies.push({
                user: req.user._id,
                content
            });

            await comment.save();
            
            const populatedComment = await Comment.findById(commentId)
                .populate('user', ['username', 'email'])
                .populate('replies.user', ['username', 'email']);

            res.json(populatedComment);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Get comments for a post
    async getComments(req, res) {
        try {
            const { postId } = req.params;
            const comments = await Comment.find({ post: postId })
                .sort({ createdAt: -1 })
                .populate('user', ['username', 'email'])
                .populate('replies.user', ['username', 'email']);

            res.json(comments);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Like/Unlike comment
    async toggleLike(req, res) {
        try {
            const comment = await Comment.findById(req.params.commentId);
            
            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }

            const likeIndex = comment.likes.indexOf(req.user._id);
            
            if (likeIndex === -1) {
                comment.likes.push(req.user._id);
            } else {
                comment.likes.splice(likeIndex, 1);
            }

            await comment.save();
            res.json(comment);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Delete comment
    async deleteComment(req, res) {
        try {
            const comment = await Comment.findById(req.params.commentId);
            
            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }

            if (comment.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'User not authorized' });
            }

            await comment.remove();
            res.json({ message: 'Comment removed' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

export default CommentController;
