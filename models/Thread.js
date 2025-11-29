'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Subdocument schema for replies
const ReplySchema = new Schema({
  text: { type: String, required: true },
  delete_password: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false }
});

// Main Thread schema
const ThreadSchema = new Schema({
  board: { type: String, required: true },
  text: { type: String, required: true },
  delete_password: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  bumped_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false },
  replies: [ReplySchema]
});

const Thread = mongoose.model('Thread', ThreadSchema);

// Helper function to get a thread by board and text
const getThreadId = async (board, text) => {
  try {
    const thread = await Thread.findOne({ board, text });
    return thread;
  } catch (error) {
    console.error('Error getting thread:', error);
    return null;
  }
};

// Helper function to get a reply from a thread
const getReplyId = async (threadId) => {
  try {
    const thread = await Thread.findById(threadId);
    if (thread && thread.replies && thread.replies.length > 0) {
      return thread.replies[0];
    }
    return null;
  } catch (error) {
    console.error('Error getting reply:', error);
    return null;
  }
};

// Export the model and helper functions
module.exports = Thread;
module.exports.Thread = Thread;
module.exports.getThreadId = getThreadId;
module.exports.getReplyId = getReplyId;
