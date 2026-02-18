import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { UsuariosService, UnidadesService, RolesService } from '../../services';
import type { Unidad } from '../../services';

interface UsuarioLista {
  ID: string;
  NOMBRE_COMPLETO: string;
  CORREO: string;
  ESTA_ACTIVO: boolean;
  CREADO_EN: string;
  UNIDAD_NOMBRE: string;
  UNIDAD_CODIGO: string;
  ROL_NOMBRE: string;
  ROL_CODIGO: string;
}

interface Rol { ID: string; NOMBRE: string; CODIGO: string; }

export default function Register() {
  const [users, setUsers] = useState<UsuarioLista[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [totalUsuarios, setTotalUsuarios] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<UsuarioLista | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnit, setFilterUnit] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form states
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [unidadId, setUnidadId] = useState('');
  const [rolId, setRolId] = useState('');

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [usersRes, uniRes, rolesRes] = await Promise.all([
        UsuariosService.listar({ pagina: currentPage, por_pagina: itemsPerPage, unidad_id: filterUnit || undefined, rol_id: filterRole || undefined, busqueda: searchTerm || undefined }),
        UnidadesService.listar(),
        RolesService.listar(),
      ]);
      if (usersRes.data.datos) {
        setUsers(usersRes.data.datos.registros);
        setTotalUsuarios(usersRes.data.datos.total);
      }
      if (uniRes.data.datos) setUnidades(uniRes.data.datos);
      if (rolesRes.data.datos) setRoles(rolesRes.data.datos);
    } catch (err) { console.error('Error cargando usuarios:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargarDatos(); }, [currentPage, filterUnit, filterRole, searchTerm]);

  const totalPages = Math.ceil(totalUsuarios / itemsPerPage);

  const handleOpenModal = (user?: UsuarioLista) => {
    if (user) {
      setEditingUserId(user.ID);
      setNombre(user.NOMBRE_COMPLETO);
      setCorreo(user.CORREO);
      setContrasena('');
      const uni = unidades.find(u => u.NOMBRE === user.UNIDAD_NOMBRE || u.CODIGO === user.UNIDAD_CODIGO);
      setUnidadId(uni?.ID || '');
      const rol = roles.find(r => r.NOMBRE === user.ROL_NOMBRE || r.CODIGO === user.ROL_CODIGO);
      setRolId(rol?.ID || '');
    } else {
      setEditingUserId(null);
      setNombre(''); setCorreo(''); setContrasena(''); setUnidadId(''); setRolId('');
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false); setEditingUserId(null);
    setNombre(''); setCorreo(''); setContrasena(''); setUnidadId(''); setRolId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingUserId) {
        await UsuariosService.editar(editingUserId, {
          nombre_completo: nombre, unidad_id: unidadId, rol_id: rolId
        });
      } else {
        if (!contrasena || contrasena.length < 8) { alert('La contraseña debe tener al menos 8 caracteres'); setActionLoading(false); return; }
        await UsuariosService.crear({
          nombre_completo: nombre, correo, contrasena, unidad_id: unidadId, rol_id: rolId
        });
      }
      await cargarDatos();
      handleCloseModal();
    } catch (err: any) { alert(err.response?.data?.mensaje || 'Error al guardar usuario'); }
    finally { setActionLoading(false); }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setActionLoading(true);
    try {
      await UsuariosService.eliminar(deletingUser.ID);
      await cargarDatos();
    } catch (err: any) { alert(err.response?.data?.mensaje || 'Error al eliminar usuario'); }
    finally { setActionLoading(false); setShowDeleteModal(false); setDeletingUser(null); }
  };

  const selectStyle = {
    borderRadius: '14px', backgroundColor: 'rgba(28, 29, 36, 0.8)',
    borderColor: 'rgba(157, 131, 62, 0.3)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='14' height='9' viewBox='0 0 14 9' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L7 7.5L13 1.5' stroke='%239D833E' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat' as const, backgroundPosition: 'right 1rem center', backgroundSize: '14px',
    fontSize: '14px', letterSpacing: '0.3px'
  };
  const onSelectFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    e.target.style.borderColor = '#9D833E';
    e.target.style.boxShadow = '0 0 0 4px rgba(157, 131, 62, 0.15), 0 4px 12px rgba(0, 0, 0, 0.3)';
  };
  const onSelectBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    e.target.style.borderColor = 'rgba(157, 131, 62, 0.3)';
    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)';
  };
  const inputStyle = {
    borderRadius: '14px', backgroundColor: 'rgba(42, 43, 49, 0.5)',
    borderColor: 'rgba(222, 222, 224, 0.1)', color: '#DEDEE0',
    boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)'
  };
  const onInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#9D833E';
    e.target.style.boxShadow = '0 0 0 4px rgba(157, 131, 62, 0.1), inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)';
  };
  const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(222, 222, 224, 0.1)';
    e.target.style.boxShadow = 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)';
  };

  if (loading && users.length === 0) {
    return (<div className="size-full flex items-center justify-center" style={{ backgroundColor: '#14151A' }}>
      <Loader2 className="animate-spin" size={40} style={{ color: '#9D833E' }} />
    </div>);
  }

  return (
    <div className="size-full overflow-auto p-6" style={{ backgroundColor: '#14151A' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 style={{ color: '#DEDEE0' }}>Gestión de Usuarios</h2>
            <p className="mt-1" style={{ color: '#DEDEE0', opacity: 0.6 }}>
              {totalUsuarios} usuario{totalUsuarios !== 1 ? 's' : ''} registrado{totalUsuarios !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 transition-all duration-300 hover:shadow-xl active:scale-[0.97]"
            style={{ backgroundColor: '#9D833E', color: '#14151A', borderRadius: '14px', boxShadow: '0 4px 16px 0 rgba(157, 131, 62, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)' }}>
            <Plus size={20} strokeWidth={2.5} /> Agregar Usuario
          </button>
        </div>

        {/* Filtros */}
        <div className="backdrop-blur-xl p-6 mb-6" style={{
          background: 'rgba(28, 29, 36, 0.7)', borderRadius: '24px',
          border: '1px solid rgba(222, 222, 224, 0.1)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
        }}>
          <div className="grid grid-cols-3 gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#DEDEE0', opacity: 0.5 }} />
              <input type="text" value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Buscar por nombre o email..."
                className="w-full pl-12 pr-4 py-3 backdrop-blur-md border transition-all duration-300 focus:outline-none placeholder:text-gray-500"
                style={inputStyle} />
            </div>
            <select value={filterUnit} onChange={(e) => { setFilterUnit(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-3 backdrop-blur-md border transition-all duration-300 focus:outline-none appearance-none cursor-pointer font-medium"
              style={{ ...selectStyle, color: filterUnit ? '#DEDEE0' : 'rgba(222, 222, 224, 0.5)' }}
              onFocus={onSelectFocus} onBlur={onSelectBlur}>
              <option value="" style={{ backgroundColor: '#1C1D24', color: 'rgba(222, 222, 224, 0.5)' }}>Todas las unidades</option>
              {unidades.map(u => (
                <option key={u.ID} value={u.ID} style={{ backgroundColor: '#1C1D24', color: '#DEDEE0', fontWeight: '500' }}>{u.NOMBRE}</option>
              ))}
            </select>
            <select value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-3 backdrop-blur-md border transition-all duration-300 focus:outline-none appearance-none cursor-pointer font-medium"
              style={{ ...selectStyle, color: filterRole ? '#DEDEE0' : 'rgba(222, 222, 224, 0.5)' }}
              onFocus={onSelectFocus} onBlur={onSelectBlur}>
              <option value="" style={{ backgroundColor: '#1C1D24', color: 'rgba(222, 222, 224, 0.5)' }}>Todos los roles</option>
              {roles.map(r => (
                <option key={r.ID} value={r.ID} style={{ backgroundColor: '#1C1D24', color: '#DEDEE0', fontWeight: '500' }}>{r.NOMBRE}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="backdrop-blur-xl overflow-hidden" style={{
          background: 'rgba(28, 29, 36, 0.7)', borderRadius: '24px',
          border: '1px solid rgba(222, 222, 224, 0.1)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
        }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(222, 222, 224, 0.1)' }}>
                  <th className="px-6 py-4 text-left" style={{ color: '#DEDEE0', opacity: 0.8 }}>Nombre</th>
                  <th className="px-6 py-4 text-left" style={{ color: '#DEDEE0', opacity: 0.8 }}>Email</th>
                  <th className="px-6 py-4 text-left" style={{ color: '#DEDEE0', opacity: 0.8 }}>Unidad</th>
                  <th className="px-6 py-4 text-left" style={{ color: '#DEDEE0', opacity: 0.8 }}>Rol</th>
                  <th className="px-6 py-4 text-left" style={{ color: '#DEDEE0', opacity: 0.8 }}>Estado</th>
                  <th className="px-6 py-4 text-left" style={{ color: '#DEDEE0', opacity: 0.8 }}>Fecha Registro</th>
                  <th className="px-6 py-4 text-right" style={{ color: '#DEDEE0', opacity: 0.8 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.ID} className="transition-colors duration-200"
                    style={{ borderBottom: '1px solid rgba(222, 222, 224, 0.05)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(42, 43, 49, 0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                    <td className="px-6 py-4" style={{ color: '#DEDEE0' }}>{user.NOMBRE_COMPLETO}</td>
                    <td className="px-6 py-4" style={{ color: '#DEDEE0', opacity: 0.7 }}>{user.CORREO}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-sm" style={{
                        backgroundColor: 'rgba(157, 131, 62, 0.2)', color: '#9D833E',
                        borderRadius: '8px', border: '1px solid rgba(157, 131, 62, 0.3)'
                      }}>{user.UNIDAD_NOMBRE}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-sm" style={{
                        backgroundColor: user.ROL_CODIGO === 'SUPERVISOR' || user.ROL_CODIGO === 'ADMIN' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(222, 222, 224, 0.1)',
                        color: user.ROL_CODIGO === 'SUPERVISOR' || user.ROL_CODIGO === 'ADMIN' ? '#3B82F6' : '#DEDEE0',
                        borderRadius: '8px',
                        border: `1px solid ${user.ROL_CODIGO === 'SUPERVISOR' || user.ROL_CODIGO === 'ADMIN' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(222, 222, 224, 0.2)'}`
                      }}>{user.ROL_NOMBRE}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-sm" style={{
                        backgroundColor: user.ESTA_ACTIVO ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: user.ESTA_ACTIVO ? '#10B981' : '#EF4444',
                        borderRadius: '8px', border: `1px solid ${user.ESTA_ACTIVO ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                      }}>{user.ESTA_ACTIVO ? 'Activo' : 'Inactivo'}</span>
                    </td>
                    <td className="px-6 py-4" style={{ color: '#DEDEE0', opacity: 0.6 }}>
                      {new Date(user.CREADO_EN).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenModal(user)}
                          className="p-2 transition-all duration-200 hover:scale-110 active:scale-95"
                          style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => { setDeletingUser(user); setShowDeleteModal(true); }}
                          className="p-2 transition-all duration-200 hover:scale-110 active:scale-95"
                          style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid rgba(222, 222, 224, 0.1)' }}>
              <p style={{ color: '#DEDEE0', opacity: 0.6 }}>
                Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalUsuarios)} de {totalUsuarios}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="p-2 transition-all duration-200 disabled:opacity-30"
                  style={{ backgroundColor: 'rgba(42, 43, 49, 0.5)', color: '#DEDEE0', borderRadius: '8px', border: '1px solid rgba(222, 222, 224, 0.1)' }}>
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)} className="px-4 py-2 transition-all duration-200"
                    style={{
                      backgroundColor: currentPage === page ? '#9D833E' : 'rgba(42, 43, 49, 0.5)',
                      color: currentPage === page ? '#14151A' : '#DEDEE0', borderRadius: '8px',
                      border: `1px solid ${currentPage === page ? '#9D833E' : 'rgba(222, 222, 224, 0.1)'}`,
                      boxShadow: currentPage === page ? '0 4px 16px 0 rgba(157, 131, 62, 0.4)' : 'none'
                    }}>{page}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="p-2 transition-all duration-200 disabled:opacity-30"
                  style={{ backgroundColor: 'rgba(42, 43, 49, 0.5)', color: '#DEDEE0', borderRadius: '8px', border: '1px solid rgba(222, 222, 224, 0.1)' }}>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Agregar/Editar */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-6"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
          onClick={handleCloseModal}>
          <div className="w-full max-w-2xl backdrop-blur-xl p-6"
            style={{ background: 'rgba(28, 29, 36, 0.95)', borderRadius: '24px', border: '1px solid rgba(222, 222, 224, 0.1)', boxShadow: '0 24px 64px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 style={{ color: '#DEDEE0' }}>{editingUserId ? 'Editar Usuario' : 'Agregar Usuario'}</h3>
              <button onClick={handleCloseModal} className="p-2 transition-all duration-200 hover:scale-110 active:scale-95"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2" style={{ color: '#DEDEE0', opacity: 0.8 }}>Nombre completo</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ingresa el nombre" required
                  className="w-full px-4 py-4 backdrop-blur-md border transition-all duration-300 focus:outline-none placeholder:text-gray-500"
                  style={inputStyle} onFocus={onInputFocus} onBlur={onInputBlur} />
              </div>
              <div>
                <label className="block mb-2" style={{ color: '#DEDEE0', opacity: 0.8 }}>Correo electrónico</label>
                <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="correo@empresa.com"
                  required disabled={!!editingUserId}
                  className="w-full px-4 py-4 backdrop-blur-md border transition-all duration-300 focus:outline-none placeholder:text-gray-500 disabled:opacity-50"
                  style={inputStyle} onFocus={onInputFocus} onBlur={onInputBlur} />
              </div>
              {!editingUserId && (
                <div>
                  <label className="block mb-2" style={{ color: '#DEDEE0', opacity: 0.8 }}>Contraseña</label>
                  <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} placeholder="Mínimo 8 caracteres" required
                    className="w-full px-4 py-4 backdrop-blur-md border transition-all duration-300 focus:outline-none placeholder:text-gray-500"
                    style={inputStyle} onFocus={onInputFocus} onBlur={onInputBlur} />
                </div>
              )}
              <div>
                <label className="block mb-2" style={{ color: '#DEDEE0', opacity: 0.8 }}>Unidad Organizacional</label>
                <select value={unidadId} onChange={(e) => setUnidadId(e.target.value)} required
                  className="w-full px-4 py-4 backdrop-blur-md border transition-all duration-300 focus:outline-none appearance-none cursor-pointer font-medium"
                  style={{ ...selectStyle, color: unidadId ? '#DEDEE0' : 'rgba(222, 222, 224, 0.5)' }}
                  onFocus={onSelectFocus} onBlur={onSelectBlur}>
                  <option value="" disabled style={{ backgroundColor: '#1C1D24', color: 'rgba(222, 222, 224, 0.5)' }}>Selecciona una unidad</option>
                  {unidades.map(u => (
                    <option key={u.ID} value={u.ID} style={{ backgroundColor: '#1C1D24', color: '#DEDEE0', fontWeight: '500' }}>{u.NOMBRE}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2" style={{ color: '#DEDEE0', opacity: 0.8 }}>Rol</label>
                <select value={rolId} onChange={(e) => setRolId(e.target.value)} required
                  className="w-full px-4 py-4 backdrop-blur-md border transition-all duration-300 focus:outline-none appearance-none cursor-pointer font-medium"
                  style={{ ...selectStyle, color: rolId ? '#DEDEE0' : 'rgba(222, 222, 224, 0.5)' }}
                  onFocus={onSelectFocus} onBlur={onSelectBlur}>
                  <option value="" disabled style={{ backgroundColor: '#1C1D24', color: 'rgba(222, 222, 224, 0.5)' }}>Selecciona un rol</option>
                  {roles.map(r => (
                    <option key={r.ID} value={r.ID} style={{ backgroundColor: '#1C1D24', color: '#DEDEE0', fontWeight: '500' }}>{r.NOMBRE}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="flex-1 py-4 transition-all duration-300 active:scale-[0.97]"
                  style={{ backgroundColor: 'rgba(42, 43, 49, 0.5)', color: '#DEDEE0', borderRadius: '14px', border: '1px solid rgba(222, 222, 224, 0.1)', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)' }}>Cancelar</button>
                <button type="submit" disabled={actionLoading} className="flex-1 py-4 transition-all duration-300 hover:shadow-xl active:scale-[0.97] disabled:opacity-50"
                  style={{ backgroundColor: '#9D833E', color: '#14151A', borderRadius: '14px', boxShadow: '0 4px 16px 0 rgba(157, 131, 62, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)' }}>
                  {actionLoading ? 'Guardando...' : editingUserId ? 'Guardar Cambios' : 'Agregar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && deletingUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-6"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
          onClick={() => { setShowDeleteModal(false); setDeletingUser(null); }}>
          <div className="w-full max-w-2xl backdrop-blur-xl p-6"
            style={{ background: 'rgba(28, 29, 36, 0.95)', borderRadius: '24px', border: '1px solid rgba(222, 222, 224, 0.1)', boxShadow: '0 24px 64px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 style={{ color: '#DEDEE0' }}>Eliminar Usuario</h3>
              <button onClick={() => { setShowDeleteModal(false); setDeletingUser(null); }}
                className="p-2 transition-all duration-200 hover:scale-110 active:scale-95"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <p style={{ color: '#DEDEE0', opacity: 0.8 }}>
                ¿Estás seguro de que deseas eliminar el usuario <strong>{deletingUser.NOMBRE_COMPLETO}</strong>?
              </p>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowDeleteModal(false); setDeletingUser(null); }}
                  className="flex-1 py-4 transition-all duration-300 active:scale-[0.97]"
                  style={{ backgroundColor: 'rgba(42, 43, 49, 0.5)', color: '#DEDEE0', borderRadius: '14px', border: '1px solid rgba(222, 222, 224, 0.1)' }}>Cancelar</button>
                <button type="button" onClick={handleConfirmDelete} disabled={actionLoading}
                  className="flex-1 py-4 transition-all duration-300 hover:shadow-xl active:scale-[0.97] disabled:opacity-50"
                  style={{ backgroundColor: '#9D833E', color: '#14151A', borderRadius: '14px', boxShadow: '0 4px 16px 0 rgba(157, 131, 62, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)' }}>
                  {actionLoading ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}