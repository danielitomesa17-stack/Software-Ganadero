import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import animalRoutes from './routes/animalRoutes.js';

const app = express();
const authRoutes = require('./routes/authRoutes');
// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/animales', animalRoutes);
app.use('/api', authRoutes);
// Manejo de errores global
// Al poner _next evitas el error de "defined but never used"
app.use((err, req, res, _next) => {
    console.error('❌ Error detectado:', err.message);
    res.status(500).json({ 
        error: 'Error interno en el servidor',
        detalle: process.env.NODE_ENV === 'development' ? err.message : {} 
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor modular Hacienda Danubio en puerto ${PORT}`);
});