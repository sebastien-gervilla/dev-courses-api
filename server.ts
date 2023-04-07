// Default imports
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { initDatabaseConnection } from './src/config/database';

// Router imports
import { UserRouter, TutorialRouter } from './src/routes';

// Application setup
dotenv.config();
const app = express();
const port = process.env.PORT;

// Database Connection
initDatabaseConnection();

// Middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}));

// Routes
app.use('/user', UserRouter);
app.use('/tutorial', TutorialRouter);
// app.use('/category', CategoryRouter);

// Running server
app.listen(port, () => {
    console.log("========================================================");
    console.log(`\x1b[33m⚡️ Server is running at http://localhost:${port}`);
});