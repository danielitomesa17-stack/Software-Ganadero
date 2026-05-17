import connection from '../config/db.js'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const query = 'SELECT * FROM usuarios WHERE email = ?';
        
        // Convertimos la consulta a Promesa para que el await funcione a la perfección
        connection.execute(query, [email], async (err, results) => {
            if (err) {
                console.error("Error en BD:", err);
                return res.status(500).json({ success: false, error: 'Error en la base de datos.' });
            }

            // Verificar si el usuario existe
            if (!results || results.length === 0) {
                return res.status(401).json({ success: false, message: 'Credenciales de acceso incorrectas' });
            }

            const usuario = results[0];

            try {
                // Comparamos la contraseña de forma segura
                const coinciden = await bcrypt.compare(password, usuario.password);

                if (!coinciden) {
                    return res.status(401).json({ success: false, message: 'Credenciales de acceso incorrectas' });
                }

                // Generar el Token JWT
                const token = jwt.sign(
                    { id: usuario.id, rol: usuario.rol },
                    process.env.JWT_SECRET,
                    { expiresIn: '24h' }
                );

                // IMPORTANTE: Enviamos la respuesta de inmediato al Frontend
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

            } catch (bcryptError) {
                console.error("Error al comparar bcrypt:", bcryptError);
                return res.status(500).json({ success: false, error: 'Error al procesar la seguridad.' });
            }
        });

    } catch (error) {
        console.error("Error general en login:", error);
        return res.status(500).json({ success: false, error: 'Error interno del servidor.' });
    }
};