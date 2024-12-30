import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { getAllMovies, getMovieById } from './controller/movie';
import bodyParser from 'body-parser';
import Cors from 'cors';
import {
  authenticateToken,
  getProfile,
  login,
  signup,
} from './controller/auth';

dotenv.config();
const app = express();
app.use(
  Cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(bodyParser.json());

export const pgClient = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: parseInt(process.env.PG_PORT || '5432', 10),
});

pgClient.connect().catch((err: any) => {
  console.error('Failed to connect database: ', err);
});

//auth
app.post('/signup', signup);
app.post('/login', login);
app.get('/profile', authenticateToken, getProfile);

//movie
app.get('/movies', getAllMovies);
app.get('/movie/:id', getMovieById);

//
app.listen('4000', () => {
  console.log('listening port 4000');
});
