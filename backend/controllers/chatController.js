const Message = require('../models/Message');

const createChatController = (io) => {
  return {
    async sendMessage(req, res) {
      try {
        const { username, content } = req.body;

        if (!username || !content) {
          return res.status(400).json({ error: 'Username and content are required' });
        }

        // Save to MongoDB
        const message = new Message({
          username,
          content,
          timestamp: new Date()
        });
        await message.save();

        console.log('✅ Message saved:', message);

        // Broadcast via Socket.IO
        io.emit('message', message);

        res.status(200).json(message);
      } catch (error) {
        console.error('❌ Error saving message:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
};

module.exports = { createChatController };