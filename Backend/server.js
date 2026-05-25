import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import animalRoutes from './routes/animalRoutes.js';
import authRoutes from './routes/authRoutes.js';
import gastoRoutes from './routes/gastoRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

import { verificarToken } from './middlewares/authMiddlewares.js';

const app = express();
app.use('/api/gastos', verificarToken, gastoRoutes);

// Configuración de CORS corregida: Añadido método PATCH para tus botones de bloqueo
app.use(cors({
  // Cambia '*' por 'https://software-ganadero.vercel.app' para mayor seguridad
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rutas Públicas (Login/Registro)
app.use('/api/auth', authRoutes); 

// Rutas Protegidas (Middleware verificarToken aplicado antes de entrar a las rutas)
// Ahora todas las peticiones a estas rutas pasarán por la validación de JWT y estado de usuario
app.use('/api/animales', verificarToken, animalRoutes); 
app.use('/api/admin', verificarToken, adminRoutes);

// Manejo de errores global
app.use((err, req, res, _next) => {
    console.error('❌ Error detectado:', err.message);
    res.status(500).json({ 
        success: false, 
        error: 'Error interno en el servidor' 
    });
});

const PORT = process.env.PORT || 3000;
app.get('/test', (req, res) => res.json({ success: true, message: 'test route works' }));

import jwt from 'jsonwebtoken';

// DEBUG endpoint to verify JWT manually
app.get('/debug-token', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!token) {
    return res.status(400).json({ success: false, error: 'Token no enviado' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ success: true, decoded });
  } catch (err) {
    console.error('🔎 Debug token error:', err.message);
    return res.status(401).json({ success: false, error: err.message });
  }
});
app.listen(PORT, () => {
    console.log(`🚀 Servidor modular Hacienda Danubio en puerto ${PORT}`);
});