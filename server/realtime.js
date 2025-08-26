const { Server } = require('socket.io');

function setupSocketIO(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-stream', (streamId) => {
      socket.join(`stream-${streamId}`);
      console.log(`Client ${socket.id} joined stream: ${streamId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

module.exports = { setupSocketIO };