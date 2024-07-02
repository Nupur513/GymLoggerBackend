import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ConnDB } from './config/db.config.js';
import router from './routes/index.routes.js';
import cookieParser from 'cookie-parser';
import {createServer} from 'http';
import { Server } from 'socket.io';

dotenv.config();
const app = express();
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:3000', 'https://potentia.onrender.com'],
    credentials: true 
}));

const server = createServer(app);
const io = new Server(server, {
  cors: {
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST"]
  }
});

  const users = {}; // Store user IDs and socket IDs
  const usersSocket = {}; // Store socket IDs and user IDs
  io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
  
    socket.on('register', (userId, userName) => {
    //  console.log('UserId', userId)
      console.log(`User ${userId} registered with socket ID ${socket.id}`);
      users[userId] = {socketId: socket.id, userName: userName};
      usersSocket[socket.id] = {userId,userName};
      console.log('users:', users);
    });
  
    socket.on('create-gym', ({ gymName, friends }) => {
      console.log(`User ${usersSocket[socket.id].userName} is creating gym "${gymName}"`);
      socket.join(gymName);
      friends.forEach(friendId => {
        if (users[friendId]) {
          console.log(`Sending invite to user ${friendId} for gym "${gymName}"`);
          io.to(users[friendId].socketId).emit('invite', { gymName, friendId });
        }
      });
    });
  
    socket.on('join-gym', ({ gymName, userId }) => {
      console.log(`User ${userId} is joining gym "${gymName}"`);
      socket.join(gymName);
      socket.broadcast.to(gymName).emit('user-joined', { userName: users[userId].userName });
    });
  
    socket.on('reject-invite', ({ gymName, userId }) => {
      console.log(`User ${userId} rejected invite for gym "${gymName}"`);
      io.to(users[userId]).emit('invite-rejected', { gymName });
    });
  
    socket.on('complete-set', ({ gymName, userId, ExerciseName }) => {
      console.log(`User ${userId} completed a set of "${ExerciseName}" in gym "${gymName}"`);
      //console.log('users:', users);
      socket.broadcast.to(gymName).emit('set-completed', {gymName,userName: users[userId].userName, ExerciseName });
    });
  
    socket.on('disconnect', () => {
      console.log('user disconnected', socket.id);
      Object.keys(users).forEach(userId => {
        if (users[userId] === socket.id) {
          console.log(`User ${userId} disconnected`);
          delete users[userId];
        }
      });
    });
  });
  
  server.listen(4000, () => {
    console.log('listening on 4000');
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/api', router);



const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}! 🚀`);
    ConnDB();
});
