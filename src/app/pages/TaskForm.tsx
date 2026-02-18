import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { TareasService, UnidadesService, EstadosService } from '../../services';
import type { Unidad, Estado } from '../../services';

export default function TaskForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [unidadId, setUnidadId] = useState('');
  const [prioridad, setPrioridad] = useState('');
  const [estadoId, setEstadoId] = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        const [uniRes, estRes] = await Promise.all([UnidadesService.listar(), EstadosService.listar()]);
        if (uniRes.data.datos) setUnidades(uniRes.data.datos);
        if (estRes.data.datos) setEstados(estRes.data.datos);

        if (isEdit && id) {
          const { data } = await TareasService.obtener(id);
          const t = data.datos;
          if (t) {
            setTitulo(t.TITULO); setDescripcion(t.DESCRIPCION || '');
            setUnidadId(t.UNIDAD_ID || ''); setPrioridad(t.PRIORIDAD);
            setEstadoId(t.ESTADO_ID || '');
          }
        }
      } catch (err) { console.error('Error cargando form:', err); }
      finally { setLoading(false); }
    };
    cargar();
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !prioridad) return;
    setActionLoading(true);
    try {
      if (isEdit && id) {
        await TareasService.editar(id, { titulo, descripcion, prioridad, estado_id: estadoId || undefined });
      } else {
        await TareasService.crear({ titulo, descripcion, unidad_id: unidadId || undefined, prioridad });
      }
      navigate('/dashboard');
    } catch (err: any) { alert(err.response?.data?.mensaje || 'Error al guardar tarea'); }
    finally { setActionLoading(false); }
  };

  const inputStyle = {
    borderRadius: '14px', backgroundColor: 'rgba(42, 43, 49, 0.5)',
    borderColor: 'rgba(222, 222, 224, 0.1)', color: '#DEDEE0',
    borderWidth: '1px', borderStyle: 'solid' as const,
    boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)'
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#9D833E';
    e.target.style.backgroundColor = 'rgba(42, 43, 49, 0.7)';
    e.target.style.boxShadow = '0 0 0 4px rgba(157, 131, 62, 0.1), inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'rgba(222, 222, 224, 0.1)';
    e.target.style.backgroundColor = 'rgba(42, 43, 49, 0.5)';
    e.target.style.boxShadow = 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)';
  };

  if (loading) {
    return (<div className="size-full flex items-center justify-center" style={{ backgroundColor: '#14151A' }}>
      <Loader2 className="animate-spin" size={40} style={{ color: '#9D833E' }} />
    </div>);
  }

  return (
    <div className="size-full overflow-auto" style={{ backgroundColor: '#14151A' }}>
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 transition-all duration-300 active:scale-95"
            style={{ color: '#DEDEE0', opacity: 0.8 }}>
            <ArrowLeft size={20} /> Volver
          </button>
          <h2 style={{ color: '#DEDEE0' }}>{isEdit ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
          <p className="mt-1" style={{ color: '#DEDEE0', opacity: 0.6 }}>
            {isEdit ? 'Actualiza los detalles de la tarea' : 'Completa los detalles de la nueva tarea'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="backdrop-blur-xl p-6" style={{
          background: 'rgba(28, 29, 36, 0.7)', borderRadius: '24px',
          border: '1px solid rgba(222, 222, 224, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
        }}>
          <div className="space-y-6">
            {/* Título */}
            <div>
              <label className="block mb-2" style={{ color: '#DEDEE0', opacity: 0.8 }}>Título de la tarea</label>
              <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Revisión de presupuesto" required
                className="w-full px-4 py-4 backdrop-blur-md border transition-all duration-300 focus:outline-none placeholder:text-gray-500"
                style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>

            {/* Descripción */}
            <div>
              <label className="block mb-2" style={{ color: '#DEDEE0', opacity: 0.8 }}>Descripción</label>
              <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Describe los detalles de la tarea..." rows={4}
                className="w-full px-4 py-4 backdrop-blur-md border transition-all duration-300 focus:outline-none placeholder:text-gray-500 resize-none"
                style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>

            {/* Unidad */}
            <div>
              <label className="block mb-2" style={{ color: '#DEDEE0', opacity: 0.8 }}>Unidad Organizacional</label>
              <select value={unidadId} onChange={(e) => setUnidadId(e.target.value)}
                className="w-full px-4 py-4 backdrop-blur-md border transition-all duration-300 focus:outline-none appearance-none cursor-pointer"
                style={{
                  ...inputStyle, color: unidadId ? '#DEDEE0' : '#808080',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23DEDEE0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '12px'
                }} onFocus={onFocus} onBlur={onBlur}>
                <option value="" disabled>Selecciona una unidad</option>
                {unidades.map(u => (
                  <option key={u.ID} value={u.ID} style={{ backgroundColor: '#1C1D24', color: '#DEDEE0' }}>{u.NOMBRE}</option>
                ))}
              </select>
            </div>

            {/* Prioridad */}
            <div>
              <label className="block mb-3" style={{ color: '#DEDEE0', opacity: 0.8 }}>Prioridad</label>
              <div className="flex gap-3">
                {[
                  { value: 'BAJA', label: 'Baja', color: '#10B981' },
                  { value: 'MEDIA', label: 'Media', color: '#F59E0B' },
                  { value: 'ALTA', label: 'Alta', color: '#EF4444' }
                ].map((p) => (
                  <button key={p.value} type="button" onClick={() => setPrioridad(p.value)}
                    className="flex-1 py-3 px-4 transition-all duration-300 active:scale-[0.97]"
                    style={{
                      borderRadius: '14px',
                      backgroundColor: prioridad === p.value ? p.color : 'rgba(42, 43, 49, 0.5)',
                      color: '#DEDEE0', border: `1px solid ${prioridad === p.value ? p.color : 'rgba(222, 222, 224, 0.1)'}`,
                      boxShadow: prioridad === p.value ? `0 4px 16px 0 ${p.color}40, inset 0 1px 0 0 rgba(255, 255, 255, 0.2)` : 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
                      opacity: prioridad === p.value ? 1 : 0.7
                    }}>{p.label}</button>
                ))}
              </div>
            </div>

            {/* Estado (solo en edit) */}
            {isEdit && (
              <div>
                <label className="block mb-3" style={{ color: '#DEDEE0', opacity: 0.8 }}>Estado</label>
                <div className="flex flex-wrap gap-3">
                  {estados.filter(e => e.ESTA_ACTIVO).sort((a, b) => a.ORDEN - b.ORDEN).map((e) => (
                    <button key={e.ID} type="button" onClick={() => setEstadoId(e.ID)}
                      className="flex-1 py-3 px-4 transition-all duration-300 active:scale-[0.97]"
                      style={{
                        borderRadius: '14px', minWidth: '120px',
                        backgroundColor: estadoId === e.ID ? '#9D833E' : 'rgba(42, 43, 49, 0.5)',
                        color: estadoId === e.ID ? '#14151A' : '#DEDEE0',
                        border: `1px solid ${estadoId === e.ID ? '#9D833E' : 'rgba(222, 222, 224, 0.1)'}`,
                        boxShadow: estadoId === e.ID ? '0 4px 16px 0 rgba(157, 131, 62, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)' : 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)'
                      }}>{e.NOMBRE}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => navigate(-1)}
                className="flex-1 py-4 transition-all duration-300 active:scale-[0.97]"
                style={{ backgroundColor: 'rgba(42, 43, 49, 0.5)', color: '#DEDEE0', borderRadius: '14px', border: '1px solid rgba(222, 222, 224, 0.1)', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)' }}>
                Cancelar
              </button>
              <button type="submit" disabled={actionLoading}
                className="flex-1 py-4 transition-all duration-300 hover:shadow-xl active:scale-[0.97] disabled:opacity-50"
                style={{ backgroundColor: '#9D833E', color: '#14151A', borderRadius: '14px', boxShadow: '0 4px 16px 0 rgba(157, 131, 62, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)' }}>
                {actionLoading ? 'Guardando...' : isEdit ? 'Actualizar Tarea' : 'Crear Tarea'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}