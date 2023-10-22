// socket.js
const socket = require('socket.io');

module.exports = function setupSocket(server) {
  const io = socket(server, {
    cors: {
      origin: '*',
    },
  });

  global.onlineUsers = new Map();

  io.on('connection', (socket) => {
    global.chatSocket = socket;

    socket.on('add-user', (userId) => {
      onlineUsers.set(userId, socket.id);
    });

    console.log({ onlineUsers });

    socket.on('disconnect', () => {
      // Remove the disconnected user from the onlineUsers Map
      for (const [userId, socketId] of onlineUsers) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
    });

    socket.on('send-msg', (data) => {
      console.log({ data });
      const sendUserSocket = global.onlineUsers.get(data.to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit('msg-recieve', data.message);
      }
    });

    socket.on('send-social-msg', (data) => {
      console.log({ data });
      const sendUserSocket = global.onlineUsers.get(data.to);
      console.log({ sendUserSocket });
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit('msg-social-receive', {
          message: data.message,
          from: data.from,
          conversationId: data.conversationId,
        });
      }
    });

    socket.on('send-social-group-message', (data) => {
      const otherUserIds = data.to;
      otherUserIds.forEach((userId) => {
        const sendUserSocket = global.onlineUsers.get(userId);
        if (sendUserSocket) {
          socket.to(sendUserSocket).emit('msg-social-group-receive', {
            message: data.message,
            from: data.from,
            conversationId: data.conversationId,
          });
        }
      });
    });
  });

  return io;
};
