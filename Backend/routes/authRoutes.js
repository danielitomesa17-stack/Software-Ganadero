import express from 'express';
const router = express.Router();
import { login } from '../controllers/authController.js'; // Ojo al .js al final

router.post('/login', login);

export default router;