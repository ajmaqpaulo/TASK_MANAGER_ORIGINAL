import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Shield, Loader2 } from 'lucide-react';
import { RolesService } from '../../services';
import type { Rol, Permiso, Pantalla, Reporte } from '../../services';

export default function Roles() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [permisosCatalogo, setPermisosCatalogo] = useState<Permiso[]>([]);
  const [pantallasCatalogo, setPantallasCatalogo] = useState<Pantalla[]>([]);
  const [reportesCatalogo, setReportesCatalogo] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nombre: '', codigo: '', descripcion: '', permisos_ids: [] as string[], pantallas_ids: [] as string[], reportes_ids: [] as string[], color: '#9D833E' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  // Para almacenar detalle de permisos/pantallas/reportes por rol
  const [rolesDetalle, setRolesDetalle] = useState<Record<string, { permisos: string[]; pantallas: string[]; reportes: string[] }>>({});

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [rolesRes, permRes, pantRes, repRes] = await Promise.all([
        RolesService.listar(), RolesService.permisos(), RolesService.pantallas(), RolesService.reportesCatalogo(),
      ]);
      const rolesData = rolesRes.data.datos || [];
      setRoles(rolesData);
      if (permRes.data.datos) setPermisosCatalogo(permRes.data.datos);
      if (pantRes.data.datos) setPantallasCatalogo(pantRes.data.datos);
      if (repRes.data.datos) setReportesCatalogo(repRes.data.datos);

      // Cargar detalle de cada rol
      const detalles: Record<string, any> = {};
      await Promise.all(rolesData.map(async (r: Rol) => {
        try {
          const { data } = await RolesService.obtener(r.ID);
          const d = data.datos;
          detalles[r.ID] = {
            permisos: (d?.permisos || []).map((p: any) => p.NOMBRE || p.CODIGO),
            pantallas: (d?.pantallas || []).map((p: any) => p.NOMBRE || p.CODIGO),
            reportes: (d?.reportes || []).map((p: any) => p.NOMBRE || p.CODIGO),
          };
        } catch { detalles[r.ID] = { permisos: [], pantallas: [], reportes: [] }; }
      }));
      setRolesDetalle(detalles);
    } catch (err) { console.error('Error cargando roles:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleOpenModal = async (role?: Rol) => {
    if (role) {
      setEditingRoleId(role.ID);
      try {
        const { data } = await RolesService.obtener(role.ID);
        const d = data.datos;
        setFormData({
          nombre: role.NOMBRE, codigo: role.CODIGO, descripcion: role.DESCRIPCION || '',
          permisos_ids: (d?.permisos || []).map((p: any) => p.ID),
          pantallas_ids: (d?.pantallas || []).map((p: any) => p.ID),
          reportes_ids: (d?.reportes || []).map((p: any) => p.ID),
          color: '#9D833E',
        });
      } catch { setFormData({ nombre: role.NOMBRE, codigo: role.CODIGO, descripcion: role.DESCRIPCION || '', permisos_ids: [], pantallas_ids: [], reportes_ids: [], color: '#9D833E' }); }
    } else {
      setEditingRoleId(null);
      setFormData({ nombre: '', codigo: '', descripcion: '', permisos_ids: [], pantallas_ids: [], reportes_ids: [], color: '#9D833E' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => { setShowModal(false); setEditingRoleId(null); };

  const toggle = (arr: string[], id: string) => arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id];

  const handleSubmit = async () => {
    if (!formData.nombre.trim()) return;
    setActionLoading(true);
    try {
      const payload = { nombre: formData.nombre, codigo: formData.codigo.toUpperCase(), descripcion: formData.descripcion, permisos_ids: formData.permisos_ids, pantallas_ids: formData.pantallas_ids, reportes_ids: formData.reportes_ids };
      if (editingRoleId) { await RolesService.editar(editingRoleId, payload); }
      else { if (!formData.codigo.trim()) { alert('El código es requerido'); setActionLoading(false); return; } await RolesService.crear(payload); }
      await cargarDatos(); handleCloseModal();
    } catch (err: any) { alert(err.response?.data?.mensaje || 'Error al guardar rol'); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(true);
    try { await RolesService.eliminar(id); await cargarDatos(); }
    catch (err: any) { alert(err.response?.data?.mensaje || 'Error al eliminar rol'); }
    finally { setActionLoading(false); setShowDeleteModal(false); setRoleToDelete(null); }
  };

  const filteredRoles = roles.filter(r => r.NOMBRE.toLowerCase().includes(searchTerm.toLowerCase()) || (r.DESCRIPCION || '').toLowerCase().includes(searchTerm.toLowerCase()));

  const CheckIcon = () => (<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="#14151A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
  const CheckboxBtn = ({ selected, label, onClick }: { selected: boolean; label: string; onClick: () => void }) => (
    <button onClick={onClick} className="px-4 py-3 text-left transition-all duration-300 active:scale-[0.98]"
      style={{ backgroundColor: selected ? 'rgba(157, 131, 62, 0.2)' : 'rgba(42, 43, 49, 0.5)', color: selected ? '#9D833E' : '#DEDEE0', borderRadius: '10px', border: selected ? '2px solid #9D833E' : '1px solid rgba(222, 222, 224, 0.1)', fontSize: '14px' }}>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded flex items-center justify-center" style={{ backgroundColor: selected ? '#9D833E' : 'transparent', border: selected ? 'none' : '2px solid rgba(222, 222, 224, 0.3)' }}>
          {selected && <CheckIcon />}
        </div>
        <span>{label}</span>
      </div>
    </button>
  );

  if (loading) { return (<div className="size-full flex items-center justify-center" style={{ backgroundColor: '#14151A' }}><Loader2 className="animate-spin" size={40} style={{ color: '#9D833E' }} /></div>); }

  return (
    <div className="size-full p-6 overflow-auto" style={{ backgroundColor: '#14151A' }}>
      <div className="fixed top-20 left-20 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }} />

      <div className="mb-6 flex items-center justify-between relative z-10">
        <div>
          <h2 className="flex items-center gap-3" style={{ color: '#DEDEE0' }}><Shield size={32} /> Roles y Permisos</h2>
          <p className="mt-1" style={{ color: '#DEDEE0', opacity: 0.6 }}>Gestiona los roles y sus permisos en el sistema</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-6 py-3 transition-all duration-300 hover:shadow-xl active:scale-[0.97]"
          style={{ backgroundColor: '#9D833E', color: '#14151A', borderRadius: '14px', boxShadow: '0 4px 16px 0 rgba(157, 131, 62, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)' }}>
          <Plus size={20} /> Nuevo Rol
        </button>
      </div>

      <div className="mb-6 backdrop-blur-xl p-4" style={{ background: 'linear-gradient(135deg, rgba(28, 29, 36, 0.9) 0%, rgba(28, 29, 36, 0.7) 100%)', borderRadius: '16px', border: '1px solid rgba(222, 222, 224, 0.15)', boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)' }}>
        <input type="text" placeholder="Buscar por nombre o descripción..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 backdrop-blur-md border transition-all duration-300 focus:outline-none placeholder:text-gray-500"
          style={{ borderRadius: '12px', backgroundColor: 'rgba(42, 43, 49, 0.5)', borderColor: 'rgba(222, 222, 224, 0.1)', color: '#DEDEE0', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)' }}
          onFocus={(e) => { e.target.style.borderColor = '#9D833E'; e.target.style.boxShadow = '0 0 0 4px rgba(157, 131, 62, 0.1), inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(222, 222, 224, 0.1)'; e.target.style.boxShadow = 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)'; }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoles.map((role) => {
          const detalle = rolesDetalle[role.ID] || { permisos: [], pantallas: [], reportes: [] };
          const roleColor = '#9D833E';
          return (
            <div key={role.ID} className="backdrop-blur-xl p-6 transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(28, 29, 36, 0.9) 0%, rgba(28, 29, 36, 0.7) 100%)', borderRadius: '18px', border: '1px solid rgba(222, 222, 224, 0.15)', boxShadow: '0 8px 24px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)' }}>
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-700 blur-3xl pointer-events-none" style={{ background: `radial-gradient(circle, ${roleColor} 0%, transparent 70%)` }} />
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[18px] opacity-50" style={{ background: `linear-gradient(90deg, transparent, ${roleColor}, transparent)` }} />
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${roleColor}25`, border: `1px solid ${roleColor}40`, boxShadow: `0 4px 12px ${roleColor}20` }}>
                    <Shield size={24} style={{ color: roleColor }} />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: '#DEDEE0', fontSize: '16px' }}>{role.NOMBRE}</h3>
                    <p className="text-xs" style={{ color: '#DEDEE0', opacity: 0.5 }}>{role.CODIGO}</p>
                  </div>
                </div>
              </div>
              <p className="mb-4 text-sm leading-relaxed relative z-10" style={{ color: '#DEDEE0', opacity: 0.7 }}>{role.DESCRIPCION || 'Sin descripción'}</p>
              <div className="mb-4 relative z-10">
                <span className="text-xs font-medium" style={{ color: '#DEDEE0', opacity: 0.6 }}>Permisos ({detalle.permisos.length})</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {detalle.permisos.slice(0, 3).map((p, i) => (
                    <span key={i} className="px-2 py-1 text-xs" style={{ backgroundColor: `${roleColor}20`, color: roleColor, borderRadius: '6px', border: `1px solid ${roleColor}30` }}>{p}</span>
                  ))}
                  {detalle.permisos.length > 3 && (<span className="px-2 py-1 text-xs" style={{ backgroundColor: 'rgba(222, 222, 224, 0.1)', color: '#DEDEE0', borderRadius: '6px', opacity: 0.7 }}>+{detalle.permisos.length - 3} más</span>)}
                </div>
              </div>
              <div className="h-px mb-4 opacity-30" style={{ background: 'linear-gradient(90deg, transparent, rgba(222, 222, 224, 0.3), transparent)' }} />
              <div className="flex gap-2 relative z-10">
                <button onClick={() => handleOpenModal(role)} className="flex-1 py-2.5 text-sm font-medium transition-all duration-300 hover:shadow-lg active:scale-[0.98] backdrop-blur-md"
                  style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.3)', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)' }}>
                  <Edit2 size={14} className="inline mr-2" /> Editar
                </button>
                <button onClick={() => { setRoleToDelete(role.ID); setShowDeleteModal(true); }}
                  className="px-3 py-2.5 text-sm transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-md"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.3)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRoles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 backdrop-blur-sm rounded-xl" style={{ backgroundColor: 'rgba(28, 29, 36, 0.3)', border: '2px dashed rgba(222, 222, 224, 0.1)' }}>
          <Shield size={64} style={{ color: '#DEDEE0', opacity: 0.3 }} className="mb-4" />
          <p className="text-lg" style={{ color: '#DEDEE0', opacity: 0.6 }}>No se encontraron roles</p>
        </div>
      )}

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-6"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
          onClick={handleCloseModal}>
          <div className="w-full max-w-2xl backdrop-blur-xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ background: 'rgba(28, 29, 36, 0.95)', borderRadius: '24px', border: '1px solid rgba(222, 222, 224, 0.1)', boxShadow: '0 24px 64px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 style={{ color: '#DEDEE0' }}>{editingRoleId ? 'Editar Rol' : 'Nuevo Rol'}</h3>
              <button onClick={handleCloseModal} className="p-2 transition-all duration-200 hover:scale-110 active:scale-95"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block mb-2" style={{ color: '#DEDEE0', opacity: 0.8 }}>Nombre del Rol</label>
                <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Analista"
                  className="w-full px-4 py-3 backdrop-blur-md border transition-all duration-300 focus:outline-none placeholder:text-gray-500"
                  style={{ borderRadius: '14px', backgroundColor: 'rgba(42, 43, 49, 0.5)', borderColor: 'rgba(222, 222, 224, 0.1)', color: '#DEDEE0', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)' }}
                  onFocus={(e) => { e.target.style.borderColor = '#9D833E'; e.target.style.boxShadow = '0 0 0 4px rgba(157, 131, 62, 0.1), inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(222, 222, 224, 0.1)'; e.target.style.boxShadow = 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)'; }} />
              </div>
              {!editingRoleId && (
                <div>
                  <label className="block mb-2" style={{ color: '#DEDEE0', opacity: 0.8 }}>Código</label>
                  <input type="text" value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                    placeholder="Ej: ANALISTA"
                    className="w-full px-4 py-3 backdrop-blur-md border transition-all duration-300 focus:outline-none placeholder:text-gray-500"
                    style={{ borderRadius: '14px', backgroundColor: 'rgba(42, 43, 49, 0.5)', borderColor: 'rgba(222, 222, 224, 0.1)', color: '#DEDEE0', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)' }}
                    onFocus={(e) => { e.target.style.borderColor = '#9D833E'; e.target.style.boxShadow = '0 0 0 4px rgba(157, 131, 62, 0.1), inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(222, 222, 224, 0.1)'; e.target.style.boxShadow = 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)'; }} />
                </div>
              )}
              <div>
                <label className="block mb-2" style={{ color: '#DEDEE0', opacity: 0.8 }}>Descripción</label>
                <textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción del rol..." rows={3}
                  className="w-full px-4 py-3 backdrop-blur-md border transition-all duration-300 focus:outline-none placeholder:text-gray-500 resize-none"
                  style={{ borderRadius: '14px', backgroundColor: 'rgba(42, 43, 49, 0.5)', borderColor: 'rgba(222, 222, 224, 0.1)', color: '#DEDEE0', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)' }}
                  onFocus={(e) => { e.target.style.borderColor = '#9D833E'; e.target.style.boxShadow = '0 0 0 4px rgba(157, 131, 62, 0.1), inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(222, 222, 224, 0.1)'; e.target.style.boxShadow = 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)'; }} />
              </div>

              {/* Permisos */}
              <div>
                <label className="block mb-2" style={{ color: '#DEDEE0', opacity: 0.8 }}>Permisos del Rol</label>
                <div className="grid grid-cols-2 gap-3">
                  {permisosCatalogo.map(p => (
                    <CheckboxBtn key={p.ID} selected={formData.permisos_ids.includes(p.ID)} label={p.NOMBRE}
                      onClick={() => setFormData({ ...formData, permisos_ids: toggle(formData.permisos_ids, p.ID) })} />
                  ))}
                </div>
              </div>

              {/* Pantallas */}
              <div>
                <label className="block mb-2" style={{ color: '#DEDEE0', opacity: 0.8 }}>Pantallas Autorizadas</label>
                <div className="grid grid-cols-2 gap-3">
                  {pantallasCatalogo.map(p => (
                    <CheckboxBtn key={p.ID} selected={formData.pantallas_ids.includes(p.ID)} label={p.NOMBRE}
                      onClick={() => setFormData({ ...formData, pantallas_ids: toggle(formData.pantallas_ids, p.ID) })} />
                  ))}
                </div>
              </div>

              {/* Reportes */}
              <div>
                <label className="block mb-2" style={{ color: '#DEDEE0', opacity: 0.8 }}>Reportes Autorizados</label>
                <div className="grid grid-cols-2 gap-3">
                  {reportesCatalogo.map(r => (
                    <CheckboxBtn key={r.ID} selected={formData.reportes_ids.includes(r.ID)} label={r.NOMBRE}
                      onClick={() => setFormData({ ...formData, reportes_ids: toggle(formData.reportes_ids, r.ID) })} />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handleCloseModal} className="flex-1 py-3 transition-all duration-300 active:scale-[0.97]"
                  style={{ backgroundColor: 'rgba(42, 43, 49, 0.5)', color: '#DEDEE0', borderRadius: '14px', border: '1px solid rgba(222, 222, 224, 0.1)' }}>Cancelar</button>
                <button onClick={handleSubmit} disabled={actionLoading}
                  className="flex-1 py-3 transition-all duration-300 hover:shadow-xl active:scale-[0.97] disabled:opacity-50"
                  style={{ backgroundColor: '#9D833E', color: '#14151A', borderRadius: '14px', boxShadow: '0 4px 16px 0 rgba(157, 131, 62, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)' }}>
                  {actionLoading ? 'Guardando...' : editingRoleId ? 'Guardar Cambios' : 'Crear Rol'}
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
            <p style={{ color: '#DEDEE0', opacity: 0.8 }} className="mb-6">¿Está seguro de que desea eliminar este rol?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 transition-all duration-300 active:scale-[0.97]"
                style={{ backgroundColor: 'rgba(42, 43, 49, 0.5)', color: '#DEDEE0', borderRadius: '14px', border: '1px solid rgba(222, 222, 224, 0.1)' }}>Cancelar</button>
              <button onClick={() => { if (roleToDelete) handleDelete(roleToDelete); }} disabled={actionLoading}
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