import express, { Request, Response, NextFunction } from 'express';
import { pgClient } from '..';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const PORT = 3000;
const JWT_SECRET = 'your_jwt_secret'; // Replace with a secure secret

interface UserPayload {
  userId: number; // JWT에 포함된 사용자 ID
  iat?: number; // 발급 시간 (옵션)
  exp?: number; // 만료 시간 (옵션)
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload; // 인증된 사용자 정보를 저장
    }
  }
}

// Register Route
export const signup = async (req: Request, res: Response) => {
  const { name, username, password } = req.body;
  console.log(req.body);
  if (!username || !password) {
    res.status(400).json({ error: 'username and password are required.' });
    return;
  }

  try {
    const result = await pgClient.query(
      'select * from sample.user where username = $1',
      [username],
    );
    if (result.rows.length !== 0) {
      res.status(400).json({ error: '이미 존재하는 아이디입니다' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const newUser = await pgClient.query(
        'insert into sample.user (name, username, password) values ($1, $2, $3) returning id',
        [name, username, hashedPassword],
      );

      res.status(201).json({
        message: 'User registered successfully.',
        userId: newUser.rows[0].id,
      });
    } catch (error) {
      console.error('Error inserting user: ', error);
      res.status(500).json({ error: 'Failed to insert user' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong.' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  try {
    const result = await pgClient.query(
      'select * from sample.user where username = $1',
      [username],
    );
    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      result.rows[0].password,
    );
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign({ userId: result.rows[0].id }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ message: 'Login successful.', token });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong.' });
  }
};

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required.' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as UserPayload;
    req.user = payload;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized access.' });
      return;
    }
    const result = await pgClient.query(
      'select * from sample.user where id = $1',
      [req.user.userId],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res
      .status(200)
      .json({ name: result.rows[0].name, username: result.rows[0].username }); // Assuming `name` is a field
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong.' });
  }
};
