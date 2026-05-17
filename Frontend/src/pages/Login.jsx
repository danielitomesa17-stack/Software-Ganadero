import React, { useState } from 'react';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import api from '../axios/axios'; 

const Login = ({ onLogin }) => {
  const [credenciales, setCredenciales] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredenciales(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      // Usamos nuestra instancia de Axios. El '/login' se sumará a la URL de Render automáticamente.
      const response = await api.post('/login', credenciales);

      // Axios guarda la respuesta del servidor directamente en la propiedad 'data'
      if (response.data) {
        onLogin(response.data);
      }
    } catch (err) {
      // Capturamos los errores devueltos por el backend en Render
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Credenciales de acceso incorrectas');
      } else {
        setError('Error de conexión con el servidor de la Hacienda');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 font-sans relative bg-cover bg-center" 
      style={{ backgroundImage: "url('/Logo.svg')" }} // Asegúrate de que esta foto esté en la carpeta /public
    >
      
      {/* Overlay oscuro para legibilidad (Capa de contraste) */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"></div>

      {/* Tarjeta Glassmorphism */}
      <div className="w-full max-w-md bg-white/70 backdrop-blur-md rounded-[2.5rem] shadow-2xl p-8 md:p-12 z-10 border border-white/40">
        
        {/* Encabezado con Logo */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mx-auto mb-6 drop-shadow-lg rotate-3 transition-transform hover:rotate-0 duration-500">
             <img 
                src="/Logo.svg" 
                alt="Logo.svg" 
                className="w-24 h-24 object-contain" 
             />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            Software <span className="text-green-700">Ganadero</span>
          </h1>
          <p className="text-slate-600 text-[10px] font-bold tracking-[0.2em] uppercase mt-2">
            Gestión de Producción
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">
              Correo Institucional
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-green-700 transition-colors" size={18} />
              <input
                name="email"
                type="email"
                required
                value={credenciales.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-white/50 border-2 border-white/20 rounded-2xl outline-none focus:border-green-600 focus:bg-white/80 transition-all font-semibold text-slate-800 placeholder:text-slate-400"
                placeholder="usuario@hacienda.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">
              Contraseña de Acceso
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-green-700 transition-colors" size={18} />
              <input
                name="password"
                type="password"
                required
                value={credenciales.password}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-white/50 border-2 border-white/20 rounded-2xl outline-none focus:border-green-600 focus:bg-white/80 transition-all font-semibold text-slate-800 placeholder:text-slate-400"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Alerta de Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-100/80 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-bold animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-[#0F172A] hover:bg-slate-800 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
          >
            {cargando ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Entrando...
              </>
            ) : (
              'Ingresar al Sistema'
            )}
          </button>
        </form>

        <p className="text-center text-slate-600 text-[10px] mt-8 font-bold italic">
          Software Ganadero v2.0
        </p>
      </div>
    </div>
  );
};

export default Login;