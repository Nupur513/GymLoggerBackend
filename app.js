import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ConnDB } from './config/db.config.js';
import router from './routes/index.routes.js';
import cookieParser from 'cookie-parser';



dotenv.config();
const app = express();
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true 
}));

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