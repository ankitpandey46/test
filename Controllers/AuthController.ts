import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma/prismaClient';
import { signToken } from '../Utils/jwt';
import * as sessionService from '../Services/session';

class AuthController {

  static signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(400).json({ message: 'Email already exists' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, password: hashedPassword }
      });

      const token = signToken(user.id);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await sessionService.createSession(user.id, token, expiresAt);

      res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
      res.status(201).json({status:'Success', message: 'User created successfully' });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
      }

      const token = signToken(user.id);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); 

      await sessionService.createSession(user.id, token, expiresAt);

      res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); 

      res.status(200).json({status:'Success', message: 'Logged in successfully',token:token, userId:user.id });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}

export default AuthController;
