import { Router } from 'express';
import AuthController from '../Controllers/AuthController';

const router = Router();

router.post('/signup', AuthController.signup);

router.post('/login', AuthController.login);

// router.post('/logout', authController.logout);

export default router;
