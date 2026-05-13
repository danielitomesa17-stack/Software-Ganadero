import React from 'react';
import { Menu, Bell, UserCircle } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 lg:px-6 z-10">
      
      <div className="flex items-center gap-4">
        {/* Botón de Menú (Hamburguesa): Solo visible en pantallas pequeñas (md:hidden) */}
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none md:hidden"
          aria-label="Abrir menú"
        >
          <Menu size={24} />
        </button>

        {/* Título de la sección actual (Opcional, puede ser dinámico luego) */}
        <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">
          Hacienda El Lago
        </h1>
      </div>

      {/* Iconos de la derecha: Notificaciones y Perfil */}
      <div className="flex items-center gap-3">
        
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
          <Bell size={20} />
          {/* Punto rojo para simular una alerta de sanidad */}
          <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-700">Admin</p>
            <p className="text-xs text-gray-500">Administrador</p>
          </div>
          <button className="text-gray-500 hover:text-green-600 transition-colors">
            <UserCircle size={32} />
          </button>
        </div>
      </div>

    </header>
  );
};

export default Navbar;