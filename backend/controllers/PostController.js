import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

export const PostController = {
    // Create a new post
    async createPost(req, res) {
        try {
            const { content, media, hashtags } = req.body;
            
            const post = new Post({
                user: req.user._id,
                content,
                media,
                hashtags: hashtags.map(tag => tag.toLowerCase())
            });

            await post.save();
            res.status(201).json(post);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Get posts (with pagination)
    async getPosts(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skipIndex = (page - 1) * limit;

            const posts = await Post.find()
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skipIndex)
                .populate('user', ['username', 'email'])
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'user',
                        select: 'username'
                    }
                });

            res.json(posts);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Get posts by hashtag
    async getPostsByHashtag(req, res) {
        try {
            const { hashtag } = req.params;
            const posts = await Post.find({
                hashtags: hashtag.toLowerCase()
            })
            .sort({ createdAt: -1 })
            .populate('user', ['username', 'email']);

            res.json(posts);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Like/Unlike post
    async toggleLike(req, res) {
        try {
            const post = await Post.findById(req.params.postId);
            
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            const likeIndex = post.likes.indexOf(req.user._id);
            
            if (likeIndex === -1) {
                post.likes.push(req.user._id);
            } else {
                post.likes.splice(likeIndex, 1);
            }

            await post.save();
            res.json(post);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Delete post
    async deletePost(req, res) {
        try {
            const post = await Post.findById(req.params.postId);
            
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            if (post.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'User not authorized' });
            }

            await Comment.deleteMany({ post: post._id });
            await post.remove();
            
            res.json({ message: 'Post removed' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

export default PostController;
