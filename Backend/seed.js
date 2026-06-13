import 'dotenv/config';
import pool from './config/db.js';
import Animal from './models/Animal.js';
import Gasto from './models/Gasto.js';
import Medicamento from './models/Medicamento.js';
import Sanidad from './models/Sanidad.js';

const seedData = async () => {
    try {
        console.log("Iniciando carga de datos de prueba...");

        // Usamos una hacienda por defecto, asumiendo que al menos un usuario existe
        const [usuarios] = await pool.query('SELECT hacienda_id FROM usuarios LIMIT 1');
        if (usuarios.length === 0) {
            console.error("No hay usuarios en la base de datos para obtener un hacienda_id");
            process.exit(1);
        }
        
        const hacienda_id = usuarios[0].hacienda_id || 1;
        console.log(`Usando hacienda_id: ${hacienda_id}`);

        // Crear Animales
        for (let i = 10; i <= 15; i++) {
            await Animal.create({
                caravana_id: `CAR-0${i}`,
                peso_inicial: 200 + (i * 10),
                lote: 'Lote Norte',
                raza: 'Brahman',
                sexo: i % 2 === 0 ? 'Macho' : 'Hembra',
                estado: 'Activo',
                hacienda_id: hacienda_id,
                historial: 'Ninguno',
                foto: null,
                fecha_ingreso: new Date()
            });
            console.log(`Animal CAR-0${i} creado`);
        }

        // Crear Gastos
        for (let i = 1; i <= 5; i++) {
            await Gasto.create({
                fecha: new Date(),
                concepto: `Compra de insumos semana ${i}`,
                monto: 50000 + (i * 10000),
                categoria: 'ALIMENTO',
                hacienda_id: hacienda_id
            });
            console.log(`Gasto semana ${i} creado`);
        }

        // Crear Medicamentos
        let medId = null;
        for (let i = 1; i <= 3; i++) {
            const id = await Medicamento.create({
                nombre: `Medicamento Prueba ${i}`,
                stock: 100 + (i * 10),
                unidad: 'ml',
                precio_compra: 15000,
                hacienda_id: hacienda_id,
                fecha_vencimiento: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                numero_lote: `LOTE-${i}00`,
                stock_minimo: 10,
                stock_maximo: 200,
                presentacion: 'Frasco',
                fabricante: 'Lab ABC',
                categoria: 'Vacunas'
            });
            if (i === 1) medId = id; // Guardamos uno para sanidad
            console.log(`Medicamento Prueba ${i} creado`);
        }

        // Crear Sanidad
        // Primero obtener un animal de la bd
        const [animales] = await pool.query('SELECT id, caravana_id FROM animales WHERE hacienda_id = ? LIMIT 2', [hacienda_id]);
        
        for (const animal of animales) {
            await Sanidad.create({
                animal_id: animal.id,
                chapeta: animal.caravana_id,
                medicamento: medId,
                dosis: '5ml',
                fecha: new Date(),
                proximaDosis: new Date(new Date().setDate(new Date().getDate() + 30)),
                observacion: 'Aplicación de prueba',
                hacienda_id: hacienda_id
            });
            console.log(`Registro de sanidad para animal ${animal.caravana_id} creado`);
        }

        console.log("Carga de datos finalizada con éxito.");
    } catch (error) {
        console.error("Error al cargar datos:", error);
    } finally {
        process.exit(0);
    }
};

seedData();
