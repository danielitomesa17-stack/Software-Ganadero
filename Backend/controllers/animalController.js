import db from '../config/db.js';

// 1. Obtener animales (Read)
export const getAnimales = async (req, res) => {
    const { hacienda_id } = req.query;
    if (!hacienda_id) return res.status(400).json({ error: "Falta hacienda_id" });

    try {
        const [results] = await db.query("SELECT * FROM animales WHERE hacienda_id = ? ORDER BY id DESC", [hacienda_id]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener animales", detalle: err.message });
    }
};

// 2. Registrar animal (Create)
export const registrarAnimal = async (req, res) => {
    const { caravana_id, peso_inicial, lote, raza, sexo, estado, hacienda_id } = req.body;
    if (!hacienda_id) return res.status(400).json({ error: "El ID de la hacienda es obligatorio" });

    try {
        const historialInicial = JSON.stringify([
            { fecha: new Date().toLocaleDateString('es-CO'), peso: peso_inicial }
        ]);

        const sql = `INSERT INTO animales 
            (caravana_id, peso_inicial, peso_actual, lote, raza, sexo, estado, hacienda_id, historial) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const [result] = await db.query(sql, [caravana_id, peso_inicial, peso_inicial, lote, raza, sexo, estado, hacienda_id, historialInicial]);
        res.json({ message: "Animal registrado con éxito", id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: "No se pudo registrar", detalle: err.message });
    }
};

// 3. Actualizar Animal / Pesaje (Update)
export const actualizarAnimal = async (req, res) => {
    const { id } = req.params;
    const { peso_actual, estado, lote } = req.body;

    try {
        const [results] = await db.query("SELECT historial FROM animales WHERE id = ?", [id]);
        if (results.length === 0) return res.status(404).json({ error: "Animal no encontrado" });

        let historial = JSON.parse(results[0].historial || "[]");
        historial.push({ fecha: new Date().toLocaleDateString('es-CO'), peso: peso_actual });

        const sql = "UPDATE animales SET peso_actual = ?, estado = ?, lote = ?, historial = ? WHERE id = ?";
        await db.query(sql, [peso_actual, estado, lote, JSON.stringify(historial), id]);
        
        res.json({ message: "Pesaje actualizado correctamente" });
    } catch (err) {
        res.status(500).json({ error: "Error al actualizar", detalle: err.message });
    }
};

// 4. Eliminar Animal (Delete)
export const eliminarAnimal = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM animales WHERE id = ?", [id]);
        res.json({ message: "Animal eliminado del sistema" });
    } catch (err) {
        res.status(500).json({ error: "No se pudo eliminar", detalle: err.message });
    }
};