import { Server } from 'socket.io';

export const initSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    socket.on('join-product', (productId: string) => {
      if (!productId) return;
      const roomName = `product:${productId}`;
      socket.join(roomName);
      const clients = io.sockets.adapter.rooms.get(roomName);
      const count = clients ? clients.size : 0;
      io.to(roomName).emit('viewer-count-changed', { productId, count });
    });

    socket.on('leave-product', (productId: string) => {
      if (!productId) return;
      const roomName = `product:${productId}`;
      socket.leave(roomName);
      const clients = io.sockets.adapter.rooms.get(roomName);
      const count = clients ? clients.size : 0;
      io.to(roomName).emit('viewer-count-changed', { productId, count });
    });

    socket.on('disconnecting', () => {
      for (const room of socket.rooms) {
        if (room.startsWith('product:')) {
          const productId = room.split(':')[1];
          const clients = io.sockets.adapter.rooms.get(room);
          const count = clients ? clients.size - 1 : 0;
          socket.to(room).emit('viewer-count-changed', { productId, count });
        }
      }
    });
  });

  return io;
};
