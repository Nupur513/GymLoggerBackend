import express from 'express';

import dotenv from 'dotenv';
import { ConnDB } from './config/db.config.js';
import router from './routes/index.routes.js';

dotenv.config();
const app = express();

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