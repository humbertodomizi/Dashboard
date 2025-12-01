require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Post = require('../models/Post');
const connectDB = require('../config/db');

const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, './users.json'), 'utf-8'));
const postsData = JSON.parse(fs.readFileSync(path.join(__dirname, './posts.json'), 'utf-8'));

const importData = async () => {
  try {
    await connectDB();

    console.log('Clearing database...');
    await User.deleteMany({});
    await Post.deleteMany({});

    console.log('Importing Users...');
    const userIdMap = new Map(); // Map legacy ID to MongoDB ObjectId

    const userDocs = [];
    for (const user of usersData) {
      // Remove legacy ID from doc to let Mongo generate _id, or store it if needed.
      // We'll store it temporarily in memory map.
      const { id, ...userData } = user;
      
      // Create doc but don't save yet to get _id? No, create() saves.
      // Batch insert is faster, but we need IDs mapped.
      // Let's create instances first.
      const newUser = new User(userData);
      userIdMap.set(id, newUser._id);
      userDocs.push(newUser);
    }
    
    await User.insertMany(userDocs);
    console.log(`Imported ${userDocs.length} users.`);

    console.log('Importing Posts...');
    const postDocs = postsData.map(post => {
      const { id, userId, ...postData } = post;
      const mongoUserId = userIdMap.get(userId);
      
      if (!mongoUserId) {
        console.warn(`Post ${id} skipped: User ${userId} not found.`);
        return null;
      }

      return {
        ...postData,
        user: mongoUserId
      };
    }).filter(p => p !== null);

    await Post.insertMany(postDocs);
    console.log(`Imported ${postDocs.length} posts.`);

    console.log('Data Import Success!');
    process.exit();
  } catch (error) {
    console.error('Error with data import:', error);
    process.exit(1);
  }
};

importData();
