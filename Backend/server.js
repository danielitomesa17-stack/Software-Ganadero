import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import animalRoutes from './routes/animalRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { verificarToken } from './middlewares/authMiddlewares.js';

const app = express();

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
app.listen(PORT, () => {
    console.log(`🚀 Servidor modular Hacienda Danubio en puerto ${PORT}`);
});