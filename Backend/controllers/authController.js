import pool from '../config/db.js'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 🚀 1. GENERAMOS EL HASH REAL EN DIRECTO CON TU LIBRERÍA
        const salt = await bcrypt.genSalt(10);
        const hashGenerado = await bcrypt.hash(password, salt);
        
        console.log("==========================================");
        console.log("👉 CONTRASENA EN TEXTO PLANO:", password);
        console.log("👉 HASH OFICIAL GENERADO POR RENDER:", hashGenerado);
        console.log("==========================================");

        const query = 'SELECT * FROM usuarios WHERE email = ?';
        const [rows] = await pool.query(query, [email]);

        if (!rows || rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Credenciales de acceso incorrectas' });
        }

        const usuario = rows[0];

        // 🚀 2. BYPASS DE EMERGENCIA: 
        // Si la contraseña es 'admin123', lo dejamos pasar SÍ O SÍ sin validar la base de datos
        let coinciden = false;
        if (password === 'admin123') {
            coinciden = true; 
        } else {
            coinciden = await bcrypt.compare(password, usuario.password);
        }

        if (!coinciden) {
            return res.status(401).json({ success: false, message: 'Credenciales de acceso incorrectas' });
        }

        // Generar el Token
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            success: true,
            message: '¡Ingreso exitoso!',
            token,
            user: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error("❌ Error crítico en el proceso de Login:", error);
        return res.status(500).json({ success: false, error: 'Error interno.' });
    }
};