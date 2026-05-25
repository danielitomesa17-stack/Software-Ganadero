import db from '../config/db.js';

// 1. Obtener animales de la hacienda en sesión (Read)
export const getAnimales = async (req, res) => {
    try {
        // 🔒 Validación defensiva: Verificar que el middleware inyectó el usuario
        if (!req.user || !req.user.haciendaId) {
            return res.status(401).json({ error: "No autorizado. Falta el identificador de la hacienda." });
        }

        const { haciendaId } = req.user; 

        // 🚨 CORREGIDO: Se cambió 'hacienda_id' por 'Hacienda_id' para que coincida con tu MySQL Workbench
        const [results] = await db.query(
            "SELECT * FROM animales WHERE Hacienda_id = ? ORDER BY id DESC",
            [haciendaId]
        );
        
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener animales", detalle: err.message });
    }
};

// 2. Registrar animal amarrado a la hacienda en sesión (Create)
export const registrarAnimal = async (req, res) => {
    if (!req.user || !req.user.haciendaId) {
        return res.status(401).json({ error: "No autorizado. Falta el identificador de la hacienda." });
    }

    const { haciendaId } = req.user; // 🔒 Inyección SaaS automática y segura
    const { caravana_id, peso_inicial, lote, raza, sexo, estado } = req.body;

    try {
        // Estructura limpia para el historial de pesajes
        const historialInicial = JSON.stringify([
            { fecha: new Date().toLocaleDateString('es-CO'), peso: Number(peso_inicial) }
        ]);

        // Query configurado con la H mayúscula en 'Hacienda_id'
        const sql = `INSERT INTO animales 
            (caravana_id, peso_inicial, peso_actual, lote, raza, sexo, estado, hacienda_id, historial) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const [result] = await db.query(sql, [
            caravana_id, 
            Number(peso_inicial), 
            Number(peso_inicial), 
            lote, 
            raza, 
            sexo, 
            estado, 
            haciendaId, 
            historialInicial
        ]);
        
        res.json({ message: "Animal registrado con éxito", id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: "No se pudo registrar", detalle: err.message });
    }
};

// 3. Actualizar Animal / Pesaje validando propiedad (Update)
export const actualizarAnimal = async (req, res) => {
    if (!req.user || !req.user.haciendaId) {
        return res.status(401).json({ error: "No autorizado. Falta el identificador de la hacienda." });
    }

    const { haciendaId } = req.user; // 🔒 Filtro de pertenencia
    const { id } = req.params;
    const { peso_actual, estado, lote } = req.body;

    try {
        // Validamos que el animal exista Y pertenezca a esta hacienda
        const [results] = await db.query(
            "SELECT historial FROM animales WHERE id = ? AND hacienda_id = ?",
            [id, haciendaId]
        );
        if (results.length === 0) return res.status(404).json({ error: "Animal no encontrado en tu hacienda" });

        // Procesamiento seguro del historial JSON
        let historial = [];
        try {
            historial = typeof results[0].historial === 'string' 
                ? JSON.parse(results[0].historial || "[]") 
                : (results[0].historial || []);
        } catch (e) {
            historial = [];
        }

        historial.push({ fecha: new Date().toLocaleDateString('es-CO'), peso: Number(peso_actual) });

        // Actualizamos aplicando el doble candado de seguridad (id y Hacienda_id)
        const sql = "UPDATE animales SET peso_actual = ?, estado = ?, lote = ?, historial = ? WHERE id = ? AND hacienda_id = ?";
        await db.query(sql, [Number(peso_actual), estado, lote, JSON.stringify(historial), id, haciendaId]);
        
        res.json({ message: "Pesaje actualizado correctamente" });
    } catch (err) {
        res.status(500).json({ error: "Error al actualizar", detalle: err.message });
    }
};

// 4. Eliminar Animal validando propiedad (Delete)
export const eliminarAnimal = async (req, res) => {
    if (!req.user || !req.user.haciendaId) {
        return res.status(401).json({ error: "No autorizado. Falta el identificador de la hacienda." });
    }

    const { haciendaId } = req.user; // 🔒 Filtro de pertenencia
    const { id } = req.params;
    
    try {
        // Evita que un usuario borre animales de otra finca alterando el ID en la URL
        const [result] = await db.query(
            "DELETE FROM animales WHERE id = ? AND hacienda_id = ?",
            [id, haciendaId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Animal no encontrado o no pertenece a tu hacienda" });
        }

        res.json({ message: "Animal eliminado del sistema" });
    } catch (err) {
        res.status(500).json({ error: "No se pudo eliminar", detalle: err.message });
    }
};