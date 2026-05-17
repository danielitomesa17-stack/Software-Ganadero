import connection from '../config/db.js'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Buscar al usuario en la base de datos de Aiven
        const query = 'SELECT * FROM usuarios WHERE email = ?';
        
        connection.query(query, [email], async (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, error: 'Error en la base de datos.' });
            }

            // 2. Verificar si el usuario existe
            if (results.length === 0) {
                return res.status(401).json({ success: false, message: 'Credenciales de acceso incorrectas' });
            }

            const usuario = results[0];

            // 3. COMPARACIÓN CORRECTA: Comparamos texto plano contra el Hash de la BD
            const coinciden = await bcrypt.compare(password, usuario.password);

            if (!coinciden) {
                return res.status(401).json({ success: false, message: 'Credenciales de acceso incorrectas' });
            }

            // 4. Generar el Token JWT (Usando la clave secreta que tienes en tu .env)
            const token = jwt.sign(
                { id: usuario.id, rol: usuario.rol },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // 5. Responder con éxito al Frontend
            return res.json({
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
        console.error(error);
        return res.status(500).json({ success: false, error: 'Error interno del servidor.' });
    }
};