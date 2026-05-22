import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

export const obtenerBitacora = async (req, res) => {
    try {
        const query = `
            SELECT b.*, u.nombre as admin_nombre 
            FROM bitacora_auditoria b
            JOIN usuarios u ON b.admin_id = u.id
            ORDER BY b.fecha_registro DESC
            LIMIT 50
        `;
        const [logs] = await pool.query(query); // Usamos pool.query
        res.json(logs);
    } catch (err) {
        console.error("Error al obtener la bitácora:", err);
        res.status(500).json({ error: "Error al obtener la bitácora" });
    }
};

export const crearNuevaHacienda = async (req, res) => {
    const { nombreHacienda, nombreAdmin, emailAdmin, password } = req.body;
    // Asumimos que req.user.id viene del middleware de autenticación (el SuperAdmin que realiza la acción)
    const adminId = req.user.id; 

    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // 1. Crear la nueva Hacienda
        const [hacienda] = await connection.query(
            "INSERT INTO haciendas (nombre) VALUES (?)", 
            [nombreHacienda]
        );
        const haciendaId = hacienda.insertId;

        // 2. Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Crear el Administrador
        await connection.query(
            "INSERT INTO usuarios (nombre, email, password, hacienda_id, rol) VALUES (?, ?, ?, ?, 'Administrador')",
            [nombreAdmin, emailAdmin, passwordHash, haciendaId]
        );

        // 4. REGISTRAR EN BITÁCORA (dentro de la misma transacción)
        const descripcionLog = `Se creó la hacienda: ${nombreHacienda} con admin: ${emailAdmin}`;
        await connection.query(
            "INSERT INTO bitacora_auditoria (admin_id, accion, descripcion, ip_origen) VALUES (?, ?, ?, ?)",
            [adminId, 'CREAR_CLIENTE', descripcionLog, req.ip]
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