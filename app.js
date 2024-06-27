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

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:3000", "https://potentia.onrender.com"],
        methods: ["GET", "POST"]
    }
});


io.on('connection', socket => {
    console.log('User connected:', socket.id);
  
    // Join gym room
    socket.on('joinGym', gymId => {
      socket.join(gymId);
      console.log(`User ${socket.id} joined gym ${gymId}`);
    });
  

    socket.on('setCompleted', ({ gymId, userName, exerciseName }) => {

      io.to(gymId).emit('setCompleted', { userName, exerciseName });
    });

    socket.on('exerciseCompleted', ({ gymId, workoutId, exerciseId }) => {

        io.to(gymId).emit('exerciseCompleted', { workoutId, exerciseId });
    });

    socket.on('workoutCompleted', ({ gymId, workoutId, exerciseId }) => {
        io.to(gymId).emit('workoutCompleted', { workoutId, exerciseId });
    });
  
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
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
httpServer.listen(4000, () => {
    console.log('Server is running on port 4000');
  });