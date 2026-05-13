import React from 'react';
import { Outlet } from 'react-router-dom'; // <--- 1. ASEGÚRATE DE ESTA IMPORTACIÓN
import Sidebar from './Sidebar'; 
import Navbar from './Navbar'; 

const MainLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Tu Sidebar que acabas de mostrar */}
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
        {/* ÁREA DE CONTENIDO DINÁMICO */}
        <main className="flex-1 overflow-y-auto p-4">
          {/* 2. ESTA ES LA PIEZA CLAVE QUE CONECTA TODO */}
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default MainLayout;