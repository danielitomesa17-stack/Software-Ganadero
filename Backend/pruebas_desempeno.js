import 'dotenv/config';
import pool from './config/db.js';
import { performance } from 'perf_hooks';

const runTest = async () => {
  try {
    console.log("==========================================");
    console.log(" PRUEBAS DE DESEMPEÑO - BASE DE DATOS");
    console.log("==========================================");
    
    console.log("Conectando a la base de datos (Calentamiento)...");
    // Esto abrirá la conexión y absorberá los 3 segundos de retraso
    await pool.query('SELECT 1'); 

    console.log("\nEjecutando requerimientos RF-02 y RF-03...");
    console.log("Consultando la tabla 'animales'...\n");

    const inicio = performance.now();
    
    // Ahora ejecutamos la consulta COUNT, la conexión ya está lista
    const [rows] = await pool.query('SELECT COUNT(*) as total FROM animales');
    
    const fin = performance.now();
    
    const latencia = fin - inicio;
    
    console.log(`✅ [RF-02] La tabla 'animales' tiene un total de: ${rows[0].total} registros.`);
    console.log(`✅ [RF-03] La latencia de la consulta fue de: ${latencia.toFixed(2)} milisegundos.`);
    
  } catch (error) {
    console.error("❌ Error ejecutando la prueba:", error.message);
  } finally {
    pool.end();
    process.exit(0);
  }
};

runTest();
