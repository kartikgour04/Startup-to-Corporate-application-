const jwt = require('jsonwebtoken');
const User = require('../models/User');

const onlineUsers = new Map();

module.exports = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = await User.findById(decoded.id).select('-password');
      }
      next();
    } catch (e) { next(); }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    if (socket.user) {
      onlineUsers.set(socket.user._id.toString(), socket.id);
      socket.join(socket.user._id.toString());
      io.emit('user_online', { userId: socket.user._id });
    }

    socket.on('join_conversation', (convId) => {
      socket.join(convId);
    });

    socket.on('leave_conversation', (convId) => {
      socket.leave(convId);
    });

    socket.on('typing', ({ convId, userId }) => {
      socket.to(convId).emit('typing', { userId });
    });

    socket.on('stop_typing', ({ convId, userId }) => {
      socket.to(convId).emit('stop_typing', { userId });
    });

    socket.on('get_online_users', () => {
      socket.emit('online_users', Array.from(onlineUsers.keys()));
    });

    socket.on('disconnect', () => {
      if (socket.user) {
        onlineUsers.delete(socket.user._id.toString());
        io.emit('user_offline', { userId: socket.user._id });
      }
      console.log('Socket disconnected:', socket.id);
    });
  });
};
