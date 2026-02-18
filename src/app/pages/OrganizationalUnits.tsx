import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Building2, Loader2 } from 'lucide-react';
import { UnidadesService } from '../../services';
import type { Unidad } from '../../services';

export default function OrganizationalUnits() {
  const [units, setUnits] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unidad | null>(null);
  const [formData, setFormData] = useState({ nombre: '', codigo: '', descripcion: '', color: '#9D833E' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<string | null>(null);

  const cargarUnidades = async () => {
    setLoading(true);
    try {
      const { data } = await UnidadesService.listar();
      if (data.datos) setUnits(data.datos);
    } catch (err) { console.error('Error cargando unidades:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargarUnidades(); }, []);

  const handleOpenModal = (unit?: Unidad) => {
    if (unit) {
      setEditingUnit(unit);
      setFormData({ nombre: unit.NOMBRE, codigo: unit.CODIGO, descripcion: unit.DESCRIPCION || '', color: unit.COLOR });
    } else {
      setEditingUnit(null);
      setFormData({ nombre: '', codigo: '', descripcion: '', color: '#9D833E' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUnit(null);
    setFormData({ nombre: '', codigo: '', descripcion: '', color: '#9D833E' });
  };

  const handleSubmit = async () => {
    if (!formData.nombre.trim()) return;
    setActionLoading(true);
    try {
      if (editingUnit) {
        await UnidadesService.editar(editingUnit.ID, { nombre: formData.nombre, descripcion: formData.descripcion, color: formData.color });
      } else {
        if (!formData.codigo.trim()) { alert('El código es requerido'); setActionLoading(false); return; }
        await UnidadesService.crear({ nombre: formData.nombre, codigo: formData.codigo, descripcion: formData.descripcion, color: formData.color });
      }
      await cargarUnidades();
      handleCloseModal();
    } catch (err: any) { alert(err.response?.data?.mensaje || 'Error al guardar unidad'); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(true);
    try {
      await UnidadesService.eliminar(id);
      await cargarUnidades();
    } catch (err: any) { alert(err.response?.data?.mensaje || 'Error al eliminar unidad'); }
    finally { setActionLoading(false); setShowDeleteModal(false); setUnitToDelete(null); }
  };

  const filteredUnits = units.filter(u =>
    u.NOMBRE.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.DESCRIPCION || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (<div className="size-full flex items-center justify-center" style={{ backgroundColor: '#14151A' }}>
      <Loader2 className="animate-spin" size={40} style={{ color: '#9D833E' }} />
    </div>);
  }

  return (
    <div className="size-full p-6 overflow-auto" style={{ backgroundColor: '#14151A' }}>
      <div className="fixed top-20 right-20 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #9D833E 0%, transparent 70%)' }} />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between relative z-10">
        <div>
          <h2 className="flex items-center gap-3" style={{ color: '#DEDEE0' }}>
            <Building2 size={32} />
            Unidades Organizacionales
          </h2>
          <p className="mt-1" style={{ color: '#DEDEE0', opacity: 0.6 }}>
            Gestiona las áreas y departamentos de la organización
          </p>
        </div>
        <button onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 transition-all duration-300 hover:shadow-xl active:scale-[0.97]"
          style={{ backgroundColor: '#9D833E', color: '#14151A', borderRadius: '14px', boxShadow: '0 4px 16px 0 rgba(157, 131, 62, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)' }}>
          <Plus size={20} /> Nueva Unidad
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 backdrop-blur-xl p-4" style={{
        background: 'linear-gradient(135deg, rgba(28, 29, 36, 0.9) 0%, rgba(28, 29, 36, 0.7) 100%)',
        borderRadius: '16px', border: '1px solid rgba(222, 222, 224, 0.15)',
        boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)'
      }}>
        <input type="text" placeholder="Buscar por nombre o descripción..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 backdrop-blur-md border transition-all duration-300 focus:outline-none placeholder:text-gray-500"
          style={{ borderRadius: '12px', backgroundColor: 'rgba(42, 43, 49, 0.5)', borderColor: 'rgba(222, 222, 224, 0.1)', color: '#DEDEE0', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)' }}
          onFocus={(e) => { e.target.style.borderColor = '#9D833E'; e.target.style.boxShadow = '0 0 0 4px rgba(157, 131, 62, 0.1), inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(222, 222, 224, 0.1)'; e.target.style.boxShadow = 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)'; }}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUnits.map((unit) => (
          <div key={unit.ID}
            className="backdrop-blur-xl p-6 transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(28, 29, 36, 0.9) 0%, rgba(28, 29, 36, 0.7) 100%)',
              borderRadius: '18px', border: '1px solid rgba(222, 222, 224, 0.15)',
              boxShadow: '0 8px 24px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)'
            }}>
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-700 blur-3xl pointer-events-none"
              style={{ background: `radial-gradient(circle, ${unit.COLOR} 0%, transparent 70%)` }} />
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[18px] opacity-50"
              style={{ background: `linear-gradient(90deg, transparent, ${unit.COLOR}, transparent)` }} />

            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${unit.COLOR}25`, border: `1px solid ${unit.COLOR}40`, boxShadow: `0 4px 12px ${unit.COLOR}20` }}>
                  <Building2 size={24} style={{ color: unit.COLOR }} />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: '#DEDEE0', fontSize: '16px' }}>{unit.NOMBRE}</h3>
                  <p className="text-xs" style={{ color: '#DEDEE0', opacity: 0.5 }}>{unit.CODIGO}</p>
                </div>
              </div>
            </div>

            <p className="mb-4 text-sm leading-relaxed relative z-10" style={{ color: '#DEDEE0', opacity: 0.7 }}>
              {unit.DESCRIPCION || 'Sin descripción'}
            </p>

            <div className="h-px mb-4 opacity-30" style={{ background: 'linear-gradient(90deg, transparent, rgba(222, 222, 224, 0.3), transparent)' }} />

            <div className="flex gap-2 relative z-10">
              <button onClick={() => handleOpenModal(unit)}
                className="flex-1 py-2.5 text-sm font-medium transition-all duration-300 hover:shadow-lg active:scale-[0.98] backdrop-blur-md"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.3)', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)' }}>
                <Edit2 size={14} className="inline mr-2" /> Editar
              </button>
              <button onClick={() => { setUnitToDelete(unit.ID); setShowDeleteModal(true); }}
                className="px-3 py-2.5 text-sm transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-md"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.3)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredUnits.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 backdrop-blur-sm rounded-xl"
          style={{ backgroundColor: 'rgba(28, 29, 36, 0.3)', border: '2px dashed rgba(222, 222, 224, 0.1)' }}>
          <Building2 size={64} style={{ color: '#DEDEE0', opacity: 0.3 }} className="mb-4" />
          <p className="text-lg" style={{ color: '#DEDEE0', opacity: 0.6 }}>No se encontraron unidades organizacionales</p>
        </div>
      )}

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-6"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
          onClick={handleCloseModal}>
          <div className="w-full max-w-md backdrop-blur-xl p-6"
            style={{ background: 'rgba(28, 29, 36, 0.95)', borderRadius: '24px', border: '1px solid rgba(222, 222, 224, 0.1)', boxShadow: '0 24px 64px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 style={{ color: '#DEDEE0' }}>{editingUnit ? 'Editar Unidad' : 'Nueva Unidad Organizacional'}</h3>
              <button onClick={handleCloseModal} className="p-2 transition-all duration-200 hover:scale-110 active:scale-95"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block mb-2" style={{ color: '#DEDEE0', opacity: 0.8 }}>Nombre de la Unidad</label>
                <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Tecnología"
                  className="w-full px-4 py-3 backdrop-blur-md border transition-all duration-300 focus:outline-none placeholder:text-gray-500"
                  style={{ borderRadius: '14px', backgroundColor: 'rgba(42, 43, 49, 0.5)', borderColor: 'rgba(222, 222, 224, 0.1)', color: '#DEDEE0', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)' }}
                  onFocus={(e) => { e.target.style.borderColor = '#9D833E'; e.target.style.boxShadow = '0 0 0 4px rgba(157, 131, 62, 0.1), inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(222, 222, 224, 0.1)'; e.target.style.boxShadow = 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)'; }} />
              </div>
              {!editingUnit && (
                <div>
                  <label className="block mb-2" style={{ color: '#DEDEE0', opacity: 0.8 }}>Código</label>
                  <input type="text" value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                    placeholder="Ej: TEC"
                    className="w-full px-4 py-3 backdrop-blur-md border transition-all duration-300 focus:outline-none placeholder:text-gray-500"
                    style={{ borderRadius: '14px', backgroundColor: 'rgba(42, 43, 49, 0.5)', borderColor: 'rgba(222, 222, 224, 0.1)', color: '#DEDEE0', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)' }}
                    onFocus={(e) => { e.target.style.borderColor = '#9D833E'; e.target.style.boxShadow = '0 0 0 4px rgba(157, 131, 62, 0.1), inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(222, 222, 224, 0.1)'; e.target.style.boxShadow = 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)'; }} />
                </div>
              )}
              <div>
                <label className="block mb-2" style={{ color: '#DEDEE0', opacity: 0.8 }}>Descripción</label>
                <textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción de la unidad organizacional..." rows={3}
                  className="w-full px-4 py-3 backdrop-blur-md border transition-all duration-300 focus:outline-none placeholder:text-gray-500 resize-none"
                  style={{ borderRadius: '14px', backgroundColor: 'rgba(42, 43, 49, 0.5)', borderColor: 'rgba(222, 222, 224, 0.1)', color: '#DEDEE0', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)' }}
                  onFocus={(e) => { e.target.style.borderColor = '#9D833E'; e.target.style.boxShadow = '0 0 0 4px rgba(157, 131, 62, 0.1), inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(222, 222, 224, 0.1)'; e.target.style.boxShadow = 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)'; }} />
              </div>
              <div>
                <label className="block mb-2" style={{ color: '#DEDEE0', opacity: 0.8 }}>Color Identificador</label>
                <div className="flex gap-3">
                  {['#9D833E', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'].map(color => (
                    <button key={color} onClick={() => setFormData({ ...formData, color })} className="w-12 h-12 rounded-lg transition-all duration-200"
                      style={{ backgroundColor: color, border: formData.color === color ? '3px solid #DEDEE0' : '1px solid rgba(222, 222, 224, 0.2)', transform: formData.color === color ? 'scale(1.1)' : 'scale(1)' }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleCloseModal} className="flex-1 py-3 transition-all duration-300 active:scale-[0.97]"
                  style={{ backgroundColor: 'rgba(42, 43, 49, 0.5)', color: '#DEDEE0', borderRadius: '14px', border: '1px solid rgba(222, 222, 224, 0.1)' }}>Cancelar</button>
                <button onClick={handleSubmit} disabled={actionLoading}
                  className="flex-1 py-3 transition-all duration-300 hover:shadow-xl active:scale-[0.97] disabled:opacity-50"
                  style={{ backgroundColor: '#9D833E', color: '#14151A', borderRadius: '14px', boxShadow: '0 4px 16px 0 rgba(157, 131, 62, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)' }}>
                  {actionLoading ? 'Guardando...' : editingUnit ? 'Guardar Cambios' : 'Crear Unidad'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-6"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowDeleteModal(false)}>
          <div className="w-full max-w-md backdrop-blur-xl p-6"
            style={{ background: 'rgba(28, 29, 36, 0.95)', borderRadius: '24px', border: '1px solid rgba(222, 222, 224, 0.1)', boxShadow: '0 24px 64px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 style={{ color: '#DEDEE0' }}>Confirmar Eliminación</h3>
              <button onClick={() => setShowDeleteModal(false)} className="p-2 transition-all duration-200 hover:scale-110 active:scale-95"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ color: '#DEDEE0', opacity: 0.8 }} className="mb-6">¿Está seguro de que desea eliminar esta unidad organizacional?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 transition-all duration-300 active:scale-[0.97]"
                style={{ backgroundColor: 'rgba(42, 43, 49, 0.5)', color: '#DEDEE0', borderRadius: '14px', border: '1px solid rgba(222, 222, 224, 0.1)' }}>Cancelar</button>
              <button onClick={() => { if (unitToDelete) handleDelete(unitToDelete); }} disabled={actionLoading}
                className="flex-1 py-3 transition-all duration-300 hover:shadow-xl active:scale-[0.97] disabled:opacity-50"
                style={{ backgroundColor: '#9D833E', color: '#14151A', borderRadius: '14px', boxShadow: '0 4px 16px 0 rgba(157, 131, 62, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)' }}>
                {actionLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}