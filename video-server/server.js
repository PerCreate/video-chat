const express = require('express');
const socket = require('socket.io');

const PORT = 5000;

const app = express();

const server = app.listen(PORT, () => {
  console.log('Server is listening PORT: ', PORT);
});

const io = socket(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

let peers = [];

const bcEventTypes = {
  ACTIVE_USERS: 'ACTIVE_USERS',
  GROUP_CALL_ROOMS: 'GROUP_CALL_ROOMS'
};

io.on('connection', (socket) => {
  socket.emit('connection', null);

  console.log('user connection');

  socket.on('register_user', ({ username }) => {
    peers.push({
      username,
      socketId: socket.id
    });

    console.log('register, peers: ', peers);

    io.sockets.emit('broadcast', {
      event: bcEventTypes.ACTIVE_USERS,
      activeUsers: peers
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');

    peers = peers.filter(peer => peer.socketId !== socket.id);
    io.sockets.emit('broadcast', {
      event: bcEventTypes.ACTIVE_USERS,
      activeUsers: peers
    });
  });

  socket.on('pre-offer', (data) => {
    console.log('preOffer');

    io.to(data.callee.socketId).emit('pre-offer', {
      callerUsername: data.caller.username,
      callerSocketId: socket.id
    });
  });
});