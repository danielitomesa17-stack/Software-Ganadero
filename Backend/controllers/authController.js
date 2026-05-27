import pool from '../config/db.js'; // Importación limpia del pool de promesas
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const query = 'SELECT * FROM usuarios WHERE email = ?';
        
        // 1. En mysql2/promise, await devuelve un array donde el primer elemento [rows] son los registros
        const [rows] = await pool.query(query, [email]);

        // 2. Verificar si el usuario existe en el resultado desestructurado
        if (!rows || rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Credenciales de acceso incorrectas' });
        }

        const usuario = rows[0];

        // 3. Comparar la contraseña de forma asíncrona usando el hash real de Aiven
        const coinciden = await bcrypt.compare(password, usuario.password);

        if (!coinciden) {
            return res.status(401).json({ success: false, message: 'Credenciales de acceso incorrectas' });
        }

        // 3.5. Verificar si el usuario está bloqueado
        if (usuario.activo === 0) {
            return res.status(401).json({ success: false, message: 'Su cuenta ha sido bloqueada. Por favor, contacte al administrador.' });
        }

        // 4. Generar el Token JWT empaquetando el hacienda_id para blindar el SaaS
        console.log('DEBUG: JWT secret =', process.env.JWT_SECRET);
        const token = jwt.sign(
            { 
                id: usuario.id, 
                rol: usuario.rol,
                hacienda_id: usuario.hacienda_id,
                haciendaId: usuario.hacienda_id // keep for compatibility
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 5. Enviar la respuesta de éxito inmediata al Frontend incluyendo el hacienda_id
        return res.status(200).json({
            success: true,
            message: '¡Ingreso exitoso!',
            token,
            user: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
                haciendaId: usuario.hacienda_id // 👈 Para que React sepa a qué entorno entrar
            }
        });

    } catch (error) {
        // Cualquier fallo de conexión con Aiven caerá aquí de inmediato
        console.error("❌ Error crítico en el proceso de Login:", error);
        // Enviar detalle del error al cliente solo en modo desarrollo
        if (process.env.NODE_ENV === 'development') {
            return res.status(500).json({ success: false, error: error.message, stack: error.stack });
        }
        return res.status(500).json({ success: false, error: 'Error interno del servidor al procesar el ingreso.' });
    }
};