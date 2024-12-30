import { pgClient } from '..';
import express, { Request, Response } from 'express';

interface Movie {
  id: number;
  title: string;
  description: string;
  imageurl: string;
}

export const getAllMovies = async (req: Request, res: Response) => {
  const sql = 'select id, title, description, image_url from sample.movie';

  try {
    const result = await pgClient.query<Movie>(sql);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching movies: ', err);
    res.status(500).json({ message: 'Failed to fetch movies' });
  }
};

export const getMovieById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ message: 'Movie ID is required' });
    return;
  }
  try {
    const result = await pgClient.query(
      'select * from sample.movie where id = $1',
      [id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Movie Not found' });
      return;
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching movie by ID:', err);
    res.status(500).json({ message: 'Failed to fetch movie' });
  }
};
