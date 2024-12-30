import { pgClient } from '..';
import express, { Request, Response } from 'express';

export const getCommentsByMovieId = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pgClient.query(
      'select (username, created_at, content, rating) from comment where movie_id = $1',
      [id],
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching comment by movie id: ', err);
    res.status(500).json({ message: 'failed to fetch comments' });
  }
};

interface AddCommentBody {
  userId: number;
  movieId: number;
  content?: string;
  rating?: number;
}

interface EditCommentBody {
  id: number;
  content?: string;
}

export const addComment = async (req: Request, res: Response) => {
  const { userId, movieId, content, rating } = req.body as AddCommentBody;

  try {
    const result = await pgClient.query(
      'insert into comment (user_id, movie_id, content, rating, created_at) values ($1, $2, $3, $4, now())' +
        'returning id',
      [userId, movieId, content, rating],
    );
    res.status(201).json({
      message: 'Comment added successfully',
      commentId: result.rows[0]?.id,
    });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

export const editComment = async (req: Request, res: Response) => {
  const { id, content } = req.body as EditCommentBody;
  try {
    const result = await pgClient.query(
      'update comment set content = $2 where id = $1',
      [id, content],
    );
    res.status(201).json({
      message: 'Comment edited successfully',
    });
  } catch (err) {
    console.error('Error editing comment: ', err);
    res.status(500).json({ message: 'Failed to edit comment' });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  const id = req.params;

  try {
    const result = await pgClient.query('delete from comment where id = $1', [
      id,
    ]);
    res.status(200).json({
      message: 'Deleted comment successfuly',
    });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
};
