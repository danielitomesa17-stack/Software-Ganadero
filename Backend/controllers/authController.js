import connection from '../config/db.js'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = (req, res) => {
    const { email, password } = req.body;

    try {
        const query = 'SELECT * FROM usuarios WHERE email = ?';
        
        // Usamos .query tradicional (sin promesas cruzadas)
        connection.query(query, [email], (err, results) => {
            if (err) {
                console.error("❌ Error en BD:", err);
                return res.status(500).json({ success: false, error: 'Error en la base de datos.' });
            }

            // Verificar si el usuario existe
            if (!results || results.length === 0) {
                return res.status(401).json({ success: false, message: 'Credenciales de acceso incorrectas' });
            }

            const usuario = results[0];

            // Sincrónico para evitar que el hilo asíncrono se quede colgado si bcrypt falla
            const coinciden = bcrypt.compareSync(password, usuario.password);

            if (!coinciden) {
                return res.status(401).json({ success: false, message: 'Credenciales de acceso incorrectas' });
            }

            // Generar el Token JWT
            const token = jwt.sign(
                { id: usuario.id, rol: usuario.rol },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Responder con éxito de inmediato
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
        });

    } catch (error) {
        console.error("❌ Error general en login:", error);
        return res.status(500).json({ success: false, error: 'Error interno del servidor.' });
    }
};