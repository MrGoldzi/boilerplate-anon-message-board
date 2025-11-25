'use strict';
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbUri = process.env.DB;
    if (!dbUri) throw new Error('DB environment variable not set');

    await mongoose.connect(dbUri);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
