let io = null;

const initSocket = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    // Join user specific room
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    // Join Gaushala specific room
    socket.on('join_gaushala', (gaushalaId) => {
      if (gaushalaId) {
        socket.join(`gaushala_${gaushalaId}`);
      }
    });

    // Join admin room
    socket.on('join_admin', () => {
      socket.join('admin_channel');
    });

    socket.on('disconnect', () => {
      // Disconnected cleanly
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

const emitToUser = (userId, event, data) => {
  if (io && userId) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

const emitToGaushala = (gaushalaId, event, data) => {
  if (io && gaushalaId) {
    io.to(`gaushala_${gaushalaId}`).emit(event, data);
  }
};

const emitToAdmin = (event, data) => {
  if (io) {
    io.to('admin_channel').emit(event, data);
  }
};

const emitBroadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToGaushala,
  emitToAdmin,
  emitBroadcast
};

