const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Atlas Connection failed: ${error.message}`);
    console.log('[Database Notice] If using MongoDB Atlas, please check database credentials and IP whitelist (0.0.0.0/0) in Atlas console.');
  }
};

module.exports = connectDB;
