import 'dotenv/config';
import pool from './config/db.js';
import { performance } from 'perf_hooks';

const runTest = async () => {
  try {
    console.log("==========================================");
    console.log(" PRUEBAS DE DESEMPEÑO - BASE DE DATOS");
    console.log("==========================================");
    
    // RF - 02: Consultar cuántos registros tiene la tabla más importante
    console.log("\nEjecutando requerimientos RF-02 y RF-03...");
    console.log("Consultando la tabla 'animales'...\n");

    const inicio = performance.now();
    
    // Ejecutamos la consulta COUNT
    const [rows] = await pool.query('SELECT COUNT(*) as total FROM animales');
    
    const fin = performance.now();
    
    // RF - 03: Medir la latencia
    const latencia = fin - inicio;
    
    console.log(`✅ [RF-02] La tabla 'animales' tiene un total de: ${rows[0].total} registros.`);
    console.log(`✅ [RF-03] La latencia de la consulta fue de: ${latencia.toFixed(2)} milisegundos.`);
    
  } catch (error) {
    console.error("❌ Error ejecutando la prueba:", error.message);
  } finally {
    // Cerramos la conexión a la base de datos
    pool.end();
    process.exit(0);
  }
};

runTest();
