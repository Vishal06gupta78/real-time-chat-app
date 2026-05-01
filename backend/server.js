require('dotenv').config();  // <-- Load environment variables from .env

const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const cors = require('cors');
const setChatRoutes = require('./routes/chatRoutes');
const Message = require('./models/Message');  // <-- For the new route

const app = express();
const server = http.createServer(app);

// Environment variables (will now correctly read from .env)
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

console.log(`🔍 Using MONGODB_URI: ${MONGODB_URI}`);  // <-- See exactly what database is used

// Enable CORS for Express routes
app.use(cors({ origin: CORS_ORIGIN }));

// Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST']
  }
});

app.use(express.json());
app.use('/api/chat', setChatRoutes(io));

// MongoDB connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    console.log(`📚 Connected to database: ${mongoose.connection.db.databaseName}`);
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Store online users
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('getOnlineUsers', () => {
    socket.emit('onlineUsers', Array.from(onlineUsers.values()));
  });

  socket.on('setUsername', (username) => {
    socket.username = username;
    onlineUsers.set(socket.id, username);
    console.log('➕ User added:', username);
    console.log('📋 Current online users:', Array.from(onlineUsers.values()));
    
    io.emit('onlineUsers', Array.from(onlineUsers.values()));
    socket.broadcast.emit('userJoined', username);
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data);
  });

  socket.on('stopTyping', (data) => {
    socket.broadcast.emit('stopTyping', data);
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      onlineUsers.delete(socket.id);
      console.log('➖ User removed:', socket.username);
      io.emit('onlineUsers', Array.from(onlineUsers.values()));
      io.emit('userLeft', socket.username);
    } else {
      console.log('User disconnected (no username):', socket.id);
    }
  });
});

app.get('/debug/online', (req, res) => {
  res.json({ onlineUsers: Array.from(onlineUsers.values()) });
});

// 🆕 NEW: Get all messages (sorted newest first)
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));