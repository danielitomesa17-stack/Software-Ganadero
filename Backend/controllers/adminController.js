import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

export const crearNuevaHacienda = async (req, res) => {
    const { nombreHacienda, nombreAdmin, emailAdmin, password } = req.body;
    
    // Iniciamos la conexión para la transacción
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // 1. Crear la nueva Hacienda
        const [hacienda] = await connection.query(
            "INSERT INTO haciendas (nombre) VALUES (?)", 
            [nombreHacienda]
        );
        const haciendaId = hacienda.insertId;

        // 2. Hashear la contraseña del administrador de esta nueva hacienda
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Crear el Administrador de la Hacienda
        await connection.query(
            "INSERT INTO usuarios (nombre, email, password, hacienda_id, rol) VALUES (?, ?, ?, ?, 'Administrador')",
            [nombreAdmin, emailAdmin, passwordHash, haciendaId]
        );

        await connection.commit();
        res.status(201).json({ success: true, message: "Hacienda y admin creados con éxito", haciendaId });
        
    } catch (err) {
        await connection.rollback();
        console.error("Error al crear cliente SaaS:", err);
        res.status(500).json({ success: false, error: "Error al crear la infraestructura del cliente" });
    } finally {
        connection.release();
    }
};