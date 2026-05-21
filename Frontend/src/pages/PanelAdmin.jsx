import React, { useState } from 'react';

const PanelAdmin = ({ token }) => {
  const [form, setForm] = useState({ nombreHacienda: '', nombreAdmin: '', emailAdmin: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:3000/api/admin/crear-cliente', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(form)
    });
    
    if (res.ok) alert('¡Hacienda creada con éxito!');
    else alert('Error al crear hacienda');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-100 p-6 rounded-xl mt-6">
      <h2 className="text-lg font-bold mb-4">Crear Nueva Hacienda (Admin)</h2>
      <input className="block w-full p-2 mb-2" placeholder="Nombre Hacienda" onChange={e => setForm({...form, nombreHacienda: e.target.value})} />
      <input className="block w-full p-2 mb-2" placeholder="Nombre Admin" onChange={e => setForm({...form, nombreAdmin: e.target.value})} />
      <input className="block w-full p-2 mb-2" placeholder="Email Admin" onChange={e => setForm({...form, emailAdmin: e.target.value})} />
      <input className="block w-full p-2 mb-4" type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} />
      <button className="bg-green-700 text-white px-4 py-2 rounded">Crear Cliente</button>
    </form>
  );
};

export default PanelAdmin;