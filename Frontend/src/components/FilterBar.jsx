import React from 'react';

/**
 * FilterBar component
 * Props:
 *  - searchTerm: current search string
 *  - setSearchTerm: setter for searchTerm
 *  - filtroCategoria: selected category filter
 *  - setFiltroCategoria: setter for filtroCategoria
 *  - categorias: array of category options
 */
export const FilterBar = ({ searchTerm, setSearchTerm, filtroCategoria, setFiltroCategoria, categorias }) => {
  return (
    <div className="p-4 flex items-center gap-2 bg-slate-900/70 backdrop-blur-lg rounded-[3.5rem] border border-slate-800">
      <input
        type="text"
        placeholder="Buscar por concepto..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="flex-1 p-3 rounded-2xl bg-white/70 border border-gray-200 focus:border-blue-400/30"
      />
      <select
        className="p-3 rounded-2xl bg-white/70 border border-gray-200 focus:border-blue-400/30 w-full sm:w-auto"
        value={filtroCategoria}
        onChange={e => setFiltroCategoria(e.target.value)}
      >
        {categorias.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
};
