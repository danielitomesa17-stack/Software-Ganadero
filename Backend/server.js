import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import animalRoutes from './routes/animalRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { verificarToken } from './middlewares/authMiddlewares.js';

const app = express();

// Configuración de CORS para permitir peticiones desde tu Frontend
app.use(cors({
  origin: '*', // O usa tu dominio: 'https://software-ganadero.vercel.app'
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rutas
app.use('/api', authRoutes); // Login y registro
app.use('/api/auth', authRoutes);

// PROTEGER RUTAS: Ahora el middleware verifica el token ANTES de entrar a animalRoutes
app.use('/api/animales', verificarToken, animalRoutes); 
app.use('/api/admin', verificarToken, adminRoutes);

app.use((err, req, res, _next) => {
    console.error('❌ Error detectado:', err.message);
    res.status(500).json({ error: 'Error interno en el servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor modular Hacienda Danubio en puerto ${PORT}`);
});