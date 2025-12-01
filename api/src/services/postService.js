const Post = require('../models/Post');

const getAllPosts = async () => {
  return await Post.find().populate('user', 'firstName lastName email');
};

const getPostById = async (id) => {
  return await Post.findById(id).populate('user', 'firstName lastName email');
};

const createPost = async (postData) => {
  return await Post.create(postData);
};

const updatePost = async (id, postData) => {
  return await Post.findByIdAndUpdate(id, postData, { new: true });
};

const deletePost = async (id) => {
  return await Post.findByIdAndDelete(id);
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
};
