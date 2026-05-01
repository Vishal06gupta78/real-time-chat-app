const express = require('express');
const { createChatController } = require('../controllers/chatController');

const setChatRoutes = (io) => {
  const router = express.Router();
  const chatController = createChatController(io);

  router.post('/messages', chatController.sendMessage);

  return router;
};

module.exports = setChatRoutes;