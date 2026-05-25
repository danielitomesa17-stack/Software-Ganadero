import React from 'react';
import { useForm } from 'react-hook-form';
import { Save, X, Plus } from 'lucide-react';

/**
 * GastoForm component
 * Props:
 *  - nuevoGasto: object with concepto, monto, categoria
 *  - setNuevoGasto: setter for nuevoGasto (optional if using react-hook-form)
 *  - onSubmit: function to call with form data
 *  - editandoId: id of the gasto being edited (null if creating)
 *  - cancelarEdicion: function to reset edit mode
 */
export const GastoForm = ({ nuevoGasto, onSubmit, editandoId, cancelarEdicion, categorias }) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      concepto: nuevoGasto.concepto,
      monto: nuevoGasto.monto,
      categoria: nuevoGasto.categoria,
    },
  });

  const submitHandler = data => {
    onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      <input
        type="text"
        placeholder="CONCEPTO"
        {...register('concepto', { required: true })}
        className="w-full p-4 bg-white/50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-400/30"
      />
      <input
        type="number"
        placeholder="MONTO $"
        {...register('monto', { required: true })}
        className="w-full p-4 bg-white/50 rounded-2xl font-black outline-none border-2 border-transparent focus:border-blue-400/30"
      />
      <select
        className="w-full p-4 bg-white/50 rounded-2xl font-bold text-xs outline-none"
        {...register('categoria')}
      >
        {categorias.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <div className="flex gap-2">
        <button
          type="submit"
          className={`flex-1 py-5 text-white font-black rounded-3xl uppercase text-[10px] tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-2 ${editandoId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {editandoId ? <Save size={16} /> : <Plus size={16} />} {editandoId ? 'Actualizar' : 'Registrar'}
        </button>
        {editandoId && (
          <button
            onClick={cancelarEdicion}
            type="button"
            className="p-5 bg-slate-200 text-slate-600 rounded-3xl hover:bg-slate-300 transition-all"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </form>
  );
};
