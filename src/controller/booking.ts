import { pgClient } from '..';
import express, { Request, Response } from 'express';

interface AddBookingBody {
  userId: number;
  movieId: number;
  date: Date;
  time: number;
}

export const addBooking = async (req: Request, res: Response) => {
  const { userId, movieId, date, time } = req.body as AddBookingBody;

  try {
    const result = await pgClient.query(
      'insert into booking (user_id, movie_id, date, time, created_at) values ($1, $2, $3, $4, now())' +
        'returning id',
      [userId, movieId, date, time],
    );
    res.status(201).json({
      message: 'Booked successfully',
      bookingId: result.rows[0]?.id,
    });
  } catch (err) {
    console.error('Error booking: ', err);
    res.status(500).json({ message: 'Failed to book movie' });
  }
};

export const getBookingByUserId = async (req: Request, res: Response) => {};

export const getBookingByDate = async (req: Request, res: Response) => {};

export const cancelBooking = async (req: Request, res: Response) => {};
