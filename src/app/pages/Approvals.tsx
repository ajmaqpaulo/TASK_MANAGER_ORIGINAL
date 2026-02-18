import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight, Search, Loader2 } from 'lucide-react';
import { AprobacionesService, UnidadesService } from '../../services';
import type { Solicitud, ContadoresAprobacion, Unidad } from '../../services';

export default function Approvals() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [contadores, setContadores] = useState<ContadoresAprobacion>({ TOTAL_PENDIENTES: 0, TOTAL_APROBADAS: 0, TOTAL_RECHAZADAS: 0 });
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [rechazandoId, setRechazandoId] = useState<string | null>(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterUnit, setFilterUnit] = useState('');

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [contRes, solRes, uniRes] = await Promise.all([
        AprobacionesService.contadores(),
        AprobacionesService.listar({
          estado_solicitud: 'PENDIENTE',
          ...(filterPriority && { prioridad: filterPriority }),
          ...(filterUnit && { unidad_id: filterUnit }),
          ...(searchTerm && { busqueda: searchTerm }),
        }),
        UnidadesService.listar(),
      ]);
      if (contRes.data.datos) setContadores(contRes.data.datos);
      if (solRes.data.datos) setSolicitudes(solRes.data.datos);
      if (uniRes.data.datos) setUnidades(uniRes.data.datos);
    } catch (err) {
      console.error('Error cargando aprobaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, [filterPriority, filterUnit, searchTerm]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await AprobacionesService.aprobar(id);
      await cargarDatos();
    } catch (err: any) {
      alert(err.response?.data?.mensaje || 'Error al aprobar');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (rechazandoId !== id) {
      setRechazandoId(id);
      setMotivoRechazo('');
      return;
    }
    if (motivoRechazo.trim().length < 10) {
      alert('El motivo debe tener al menos 10 caracteres');
      return;
    }
    setActionLoading(id);
    try {
      await AprobacionesService.rechazar(id, motivoRechazo);
      setRechazandoId(null);
      setMotivoRechazo('');
      await cargarDatos();
    } catch (err: any) {
      alert(err.response?.data?.mensaje || 'Error al rechazar');
    } finally {
      setActionLoading(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'ALTA': return '#EF4444';
      case 'MEDIA': return '#F59E0B';
      case 'BAJA': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'ALTA': return 'Alta';
      case 'MEDIA': return 'Media';
      case 'BAJA': return 'Baja';
      default: return priority;
    }
  };

  const totalPages = Math.ceil(solicitudes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPending = solicitudes.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="size-full overflow-auto p-6" style={{ backgroundColor: '#14151A' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 style={{ color: '#DEDEE0' }}>Centro de Aprobaciones</h2>
          <p className="mt-1" style={{ color: '#DEDEE0', opacity: 0.6 }}>
            Supervisor Inbox - Gestiona las solicitudes pendientes
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-6 backdrop-blur-md" style={{
            background: 'rgba(28, 29, 36, 0.7)', borderRadius: '16px',
            border: '1px solid rgba(222, 222, 224, 0.1)', boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
          }}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}>
                <Clock size={28} style={{ color: '#F59E0B' }} />
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#DEDEE0', opacity: 0.6 }}>Pendientes</p>
                <p className="text-3xl font-bold" style={{ color: '#F59E0B' }}>{contadores.TOTAL_PENDIENTES}</p>
              </div>
            </div>
          </div>

          <div className="p-6 backdrop-blur-md" style={{
            background: 'rgba(28, 29, 36, 0.7)', borderRadius: '16px',
            border: '1px solid rgba(222, 222, 224, 0.1)', boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
          }}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
                <CheckCircle size={28} style={{ color: '#10B981' }} />
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#DEDEE0', opacity: 0.6 }}>Aprobadas</p>
                <p className="text-3xl font-bold" style={{ color: '#10B981' }}>{contadores.TOTAL_APROBADAS}</p>
              </div>
            </div>
          </div>

          <div className="p-6 backdrop-blur-md" style={{
            background: 'rgba(28, 29, 36, 0.7)', borderRadius: '16px',
            border: '1px solid rgba(222, 222, 224, 0.1)', boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
          }}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}>
                <XCircle size={28} style={{ color: '#EF4444' }} />
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: '#DEDEE0', opacity: 0.6 }}>Rechazadas</p>
                <p className="text-3xl font-bold" style={{ color: '#EF4444' }}>{contadores.TOTAL_RECHAZADAS}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin" style={{ color: '#9D833E' }} />
          </div>
        )}

        {/* Pending Approvals Table */}
        {!loading && (
          <div className="mb-8">
            <h3 className="mb-4" style={{ color: '#DEDEE0' }}>Solicitudes Pendientes</h3>

            {/* Filtros */}
            <div className="backdrop-blur-xl p-6 mb-6" style={{
              background: 'rgba(28, 29, 36, 0.7)', borderRadius: '24px',
              border: '1px solid rgba(222, 222, 224, 0.1)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
            }}>
              <div className="grid grid-cols-3 gap-4">
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#DEDEE0', opacity: 0.5 }} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    placeholder="Buscar por título..."
                    className="w-full pl-12 pr-4 py-3 backdrop-blur-md border transition-all duration-300 focus:outline-none placeholder:text-gray-500"
                    style={{ borderRadius: '14px', backgroundColor: 'rgba(42, 43, 49, 0.5)', borderColor: 'rgba(222, 222, 224, 0.1)', color: '#DEDEE0', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)' }}
                  />
                </div>

                <select
                  value={filterPriority}
                  onChange={(e) => { setFilterPriority(e.target.value); setCurrentPage(1); }}
                  className="w-full px-4 py-3 backdrop-blur-md border transition-all duration-300 focus:outline-none appearance-none cursor-pointer font-medium"
                  style={{
                    borderRadius: '14px', backgroundColor: 'rgba(28, 29, 36, 0.8)', borderColor: 'rgba(157, 131, 62, 0.3)',
                    color: filterPriority ? '#DEDEE0' : 'rgba(222, 222, 224, 0.5)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='14' height='9' viewBox='0 0 14 9' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L7 7.5L13 1.5' stroke='%239D833E' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '14px', fontSize: '14px'
                  }}
                >
                  <option value="" style={{ backgroundColor: '#1C1D24', color: 'rgba(222, 222, 224, 0.5)' }}>Todas las prioridades</option>
                  <option value="ALTA" style={{ backgroundColor: '#1C1D24', color: '#DEDEE0' }}>Alta</option>
                  <option value="MEDIA" style={{ backgroundColor: '#1C1D24', color: '#DEDEE0' }}>Media</option>
                  <option value="BAJA" style={{ backgroundColor: '#1C1D24', color: '#DEDEE0' }}>Baja</option>
                </select>

                <select
                  value={filterUnit}
                  onChange={(e) => { setFilterUnit(e.target.value); setCurrentPage(1); }}
                  className="w-full px-4 py-3 backdrop-blur-md border transition-all duration-300 focus:outline-none appearance-none cursor-pointer font-medium"
                  style={{
                    borderRadius: '14px', backgroundColor: 'rgba(28, 29, 36, 0.8)', borderColor: 'rgba(157, 131, 62, 0.3)',
                    color: filterUnit ? '#DEDEE0' : 'rgba(222, 222, 224, 0.5)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='14' height='9' viewBox='0 0 14 9' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L7 7.5L13 1.5' stroke='%239D833E' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '14px', fontSize: '14px'
                  }}
                >
                  <option value="" style={{ backgroundColor: '#1C1D24', color: 'rgba(222, 222, 224, 0.5)' }}>Todas las unidades</option>
                  {unidades.map(u => (
                    <option key={u.ID} value={u.ID} style={{ backgroundColor: '#1C1D24', color: '#DEDEE0' }}>{u.NOMBRE}</option>
                  ))}
                </select>
              </div>
            </div>

            {solicitudes.length === 0 ? (
              <div className="text-center py-16" style={{ color: '#DEDEE0', opacity: 0.5 }}>
                No hay solicitudes pendientes
              </div>
            ) : (
              <div className="backdrop-blur-xl overflow-hidden" style={{
                background: 'rgba(28, 29, 36, 0.7)', borderRadius: '24px',
                border: '1px solid rgba(222, 222, 224, 0.1)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
              }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(222, 222, 224, 0.1)' }}>
                        <th className="px-6 py-4 text-left" style={{ color: '#DEDEE0', opacity: 0.8 }}>Tarea</th>
                        <th className="px-6 py-4 text-left" style={{ color: '#DEDEE0', opacity: 0.8 }}>Tipo</th>
                        <th className="px-6 py-4 text-left" style={{ color: '#DEDEE0', opacity: 0.8 }}>Prioridad</th>
                        <th className="px-6 py-4 text-left" style={{ color: '#DEDEE0', opacity: 0.8 }}>Fecha</th>
                        <th className="px-6 py-4 text-right" style={{ color: '#DEDEE0', opacity: 0.8 }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPending.map((sol) => (
                        <tr key={sol.ID} className="transition-colors duration-200"
                          style={{ borderBottom: '1px solid rgba(222, 222, 224, 0.05)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(42, 43, 49, 0.3)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <td className="px-6 py-4">
                            <div style={{ color: '#DEDEE0' }}>{sol.TITULO}</div>
                            {sol.DESCRIPCION && (
                              <div className="text-xs mt-1 truncate max-w-xs" style={{ color: '#DEDEE0', opacity: 0.5 }}>{sol.DESCRIPCION}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 text-xs" style={{
                              backgroundColor: 'rgba(157, 131, 62, 0.2)', color: '#9D833E',
                              borderRadius: '8px', border: '1px solid rgba(157, 131, 62, 0.3)'
                            }}>
                              {sol.TIPO_ACCION}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 text-sm" style={{
                              backgroundColor: `${getPriorityColor(sol.PRIORIDAD)}20`,
                              color: getPriorityColor(sol.PRIORIDAD),
                              borderRadius: '8px', border: `1px solid ${getPriorityColor(sol.PRIORIDAD)}30`
                            }}>
                              {getPriorityLabel(sol.PRIORIDAD)}
                            </span>
                          </td>
                          <td className="px-6 py-4" style={{ color: '#DEDEE0', opacity: 0.6 }}>
                            {new Date(sol.CREADO_EN).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleReject(sol.ID)}
                                  disabled={actionLoading === sol.ID}
                                  className="px-4 py-2 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                                >
                                  <XCircle size={16} />
                                  Rechazar
                                </button>
                                <button
                                  onClick={() => handleApprove(sol.ID)}
                                  disabled={actionLoading === sol.ID}
                                  className="px-4 py-2 transition-all duration-200 hover:shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50"
                                  style={{ backgroundColor: '#9D833E', color: '#14151A', borderRadius: '8px', boxShadow: '0 4px 16px 0 rgba(157, 131, 62, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)' }}
                                >
                                  <CheckCircle size={16} />
                                  Aprobar
                                </button>
                              </div>
                              {/* Input motivo de rechazo */}
                              {rechazandoId === sol.ID && (
                                <div className="flex items-center gap-2 w-full">
                                  <input
                                    type="text"
                                    value={motivoRechazo}
                                    onChange={(e) => setMotivoRechazo(e.target.value)}
                                    placeholder="Motivo del rechazo (mín. 10 caracteres)..."
                                    autoFocus
                                    className="flex-1 px-3 py-2 text-sm focus:outline-none"
                                    style={{ backgroundColor: 'rgba(42, 43, 49, 0.5)', color: '#DEDEE0', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleReject(sol.ID); if (e.key === 'Escape') { setRechazandoId(null); setMotivoRechazo(''); } }}
                                  />
                                  <button
                                    onClick={() => handleReject(sol.ID)}
                                    disabled={actionLoading === sol.ID}
                                    className="px-3 py-2 text-sm disabled:opacity-50"
                                    style={{ backgroundColor: '#EF4444', color: '#fff', borderRadius: '8px' }}
                                  >
                                    Confirmar
                                  </button>
                                  <button
                                    onClick={() => { setRechazandoId(null); setMotivoRechazo(''); }}
                                    className="px-3 py-2 text-sm"
                                    style={{ backgroundColor: 'rgba(42, 43, 49, 0.5)', color: '#DEDEE0', borderRadius: '8px' }}
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid rgba(222, 222, 224, 0.1)' }}>
                    <p style={{ color: '#DEDEE0', opacity: 0.6 }}>
                      Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPerPage, solicitudes.length)} de {solicitudes.length}
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
                          }}>
                          {page}
                        </button>
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}