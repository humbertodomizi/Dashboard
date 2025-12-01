const postService = require('../services/postService');
const { postSchema, formatZodError } = require('../utils/validation');

const getAllPosts = async (req, res) => {
  try {
    const posts = await postService.getAllPosts();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await postService.getPostById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPost = async (req, res) => {
  try {
    const validatedData = postSchema.parse(req.body);
    const newPost = await postService.createPost(validatedData);
    res.status(201).json(newPost);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: formatZodError(error) });
    }
    res.status(500).json({ message: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const validatedData = postSchema.partial().parse(req.body);
    const updatedPost = await postService.updatePost(req.params.id, validatedData);
    if (!updatedPost) return res.status(404).json({ message: 'Post not found' });
    res.json(updatedPost);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: formatZodError(error) });
    }
    res.status(500).json({ message: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const deletedPost = await postService.deletePost(req.params.id);
    if (!deletedPost) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
};
