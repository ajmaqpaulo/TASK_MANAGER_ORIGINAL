import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, FileText, Users, AlertTriangle, Shield, FileDown, Search, Loader2 } from 'lucide-react';
import { ReportesService } from '../../services';
import type { ContadoresReportes } from '../../services';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReporteDef {
  codigo: string;
  name: string;
  type: string;
  description: string;
}

const REPORTES_DISPONIBLES: ReporteDef[] = [
  { codigo: 'RPT_SOLICITUDES_APROBADAS', name: 'Historial de Aprobados', type: 'approved', description: 'Reporte completo de todas las tareas aprobadas en el sistema' },
  { codigo: 'RPT_PRODUCTIVIDAD_UNIDAD', name: 'Reportes de Productividad por Unidad', type: 'productivity', description: 'Análisis de productividad y rendimiento de cada unidad organizacional' },
  { codigo: 'RPT_PRIORIDAD_CRITICIDAD', name: 'Reportes de Prioridad y Criticidad', type: 'priority', description: 'Distribución de tareas por nivel de prioridad y estado crítico' },
  { codigo: 'RPT_AUDITORIA_SISTEMA', name: 'Reportes de Auditoría y Seguridad', type: 'audit', description: 'Reporte de auditoría de accesos, cambios y cumplimiento en el sistema' },
  { codigo: 'RPT_SOLICITUDES_RECHAZADAS', name: 'Historial de Rechazados', type: 'rejected', description: 'Reporte completo de todas las solicitudes rechazadas en el sistema' },
];

export default function Reports() {
  const [contadores, setContadores] = useState<ContadoresReportes>({ REPORTES_APROBADOS: 0, REPORTES_PRODUCTIVIDAD: 0, REPORTES_CRITICIDAD: 0, REPORTES_AUDITORIA: 0 });
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 5;

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data } = await ReportesService.contadores();
        if (data.datos) setContadores(data.datos);
      } catch (err) { console.error('Error cargando contadores:', err); }
      finally { setLoading(false); }
    };
    cargar();
  }, []);

  const filteredReports = REPORTES_DISPONIBLES.filter(r =>
    !searchTerm || r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + itemsPerPage);

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'approved': return { icon: FileText, label: 'Historial de Aprobados', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.2)' };
      case 'productivity': return { icon: Users, label: 'Productividad por Unidad', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.2)' };
      case 'priority': return { icon: AlertTriangle, label: 'Prioridad y Criticidad', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.2)' };
      case 'audit': return { icon: Shield, label: 'Auditoría y Seguridad', color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.2)' };
      case 'rejected': return { icon: FileText, label: 'Historial de Rechazados', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.2)' };
      default: return { icon: FileText, label: 'Reporte', color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.2)' };
    }
  };

  const getContador = (type: string): number => {
    switch (type) {
      case 'approved': return contadores.REPORTES_APROBADOS;
      case 'productivity': return contadores.REPORTES_PRODUCTIVIDAD;
      case 'priority': return contadores.REPORTES_CRITICIDAD;
      case 'audit': return contadores.REPORTES_AUDITORIA;
      default: return 0;
    }
  };

  const handleDownload = async (report: ReporteDef) => {
    setDownloading(report.codigo);
    try {
      const { data } = await ReportesService.ejecutar(report.codigo);
      const resultado = data.datos;
      const registros: any[] = Array.isArray(resultado?.datos) ? resultado.datos : [];

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFillColor(20, 21, 26);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(157, 131, 62);
      doc.setFontSize(24);
      doc.text('Sistema de Gestión', pageWidth / 2, 20, { align: 'center' });
      doc.setTextColor(222, 222, 224);
      doc.setFontSize(12);
      doc.text('Centro de Reportes', pageWidth / 2, 30, { align: 'center' });

      // Info
      doc.setTextColor(20, 21, 26);
      doc.setFontSize(18);
      doc.text(report.name, 14, 55);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Tipo: ${getTypeConfig(report.type).label}`, 14, 65);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 72);
      doc.text(`Total de registros: ${resultado?.registros || registros.length}`, 14, 79);
      doc.setFontSize(9);
      doc.text(doc.splitTextToSize(report.description, pageWidth - 28), 14, 88);

      // Tabla dinámica desde datos reales
      if (registros.length > 0) {
        const headers = Object.keys(registros[0]);
        const body = registros.map(r => headers.map(h => String(r[h] ?? '')));
        autoTable(doc, {
          head: [headers], body, startY: 100, theme: 'striped',
          headStyles: { fillColor: [157, 131, 62], textColor: [20, 21, 26], fontSize: 10, fontStyle: 'bold', halign: 'center' },
          bodyStyles: { textColor: [20, 21, 26], fontSize: 9 },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          margin: { top: 100 }
        });
      } else {
        doc.setFontSize(12);
        doc.text('No se encontraron registros para este reporte.', 14, 110);
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        doc.text('Confidencial - Uso interno únicamente', 14, doc.internal.pageSize.getHeight() - 10);
      }

      doc.save(`${report.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err: any) { alert(err.response?.data?.mensaje || 'Error al generar reporte'); }
    finally { setDownloading(null); }
  };

  if (loading) {
    return (<div className="size-full flex items-center justify-center" style={{ backgroundColor: '#14151A' }}>
      <Loader2 className="animate-spin" size={40} style={{ color: '#9D833E' }} />
    </div>);
  }

  return (
    <div className="size-full overflow-auto p-6" style={{ backgroundColor: '#14151A' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 style={{ color: '#DEDEE0' }}>Centro de Reportes</h2>
          <p className="mt-1" style={{ color: '#DEDEE0', opacity: 0.6 }}>Accede y descarga reportes del sistema</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Aprobados', value: contadores.REPORTES_APROBADOS, color: '#10B981', icon: FileText },
            { label: 'Productividad', value: contadores.REPORTES_PRODUCTIVIDAD, color: '#3B82F6', icon: Users },
            { label: 'Criticidad', value: contadores.REPORTES_CRITICIDAD, color: '#F59E0B', icon: AlertTriangle },
            { label: 'Auditoría', value: contadores.REPORTES_AUDITORIA, color: '#8B5CF6', icon: Shield },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="p-5 backdrop-blur-md" style={{
              background: 'rgba(28, 29, 36, 0.7)', borderRadius: '16px',
              border: '1px solid rgba(222, 222, 224, 0.1)', boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
            }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}25` }}>
                  <Icon size={24} style={{ color }} />
                </div>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: '#DEDEE0', opacity: 0.6 }}>{label}</p>
                  <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="backdrop-blur-xl p-6 mb-6" style={{
          background: 'rgba(28, 29, 36, 0.7)', borderRadius: '24px',
          border: '1px solid rgba(222, 222, 224, 0.1)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
        }}>
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#DEDEE0', opacity: 0.5 }} />
            <input type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Buscar por nombre o descripción..."
              className="w-full pl-12 pr-4 py-3 backdrop-blur-md border transition-all duration-300 focus:outline-none placeholder:text-gray-500"
              style={{ borderRadius: '14px', backgroundColor: 'rgba(42, 43, 49, 0.5)', borderColor: 'rgba(222, 222, 224, 0.1)', color: '#DEDEE0', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)' }} />
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
                  <th className="px-6 py-4 text-left" style={{ color: '#DEDEE0', opacity: 0.8 }}>Nombre del Reporte</th>
                  <th className="px-6 py-4 text-left" style={{ color: '#DEDEE0', opacity: 0.8 }}>Tipo</th>
                  <th className="px-6 py-4 text-left" style={{ color: '#DEDEE0', opacity: 0.8 }}>Descripción</th>
                  <th className="px-6 py-4 text-left" style={{ color: '#DEDEE0', opacity: 0.8 }}>Registros</th>
                  <th className="px-6 py-4 text-right" style={{ color: '#DEDEE0', opacity: 0.8 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReports.map((report) => {
                  const typeConfig = getTypeConfig(report.type);
                  const Icon = typeConfig.icon;
                  return (
                    <tr key={report.codigo} className="transition-colors duration-200"
                      style={{ borderBottom: '1px solid rgba(222, 222, 224, 0.05)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(42, 43, 49, 0.3)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                      <td className="px-6 py-4" style={{ color: '#DEDEE0' }}><div className="font-medium">{report.name}</div></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 px-3 py-2 w-fit" style={{
                          backgroundColor: typeConfig.bgColor, borderRadius: '8px', border: `1px solid ${typeConfig.color}30`
                        }}>
                          <Icon size={16} style={{ color: typeConfig.color }} />
                          <span className="text-sm" style={{ color: typeConfig.color }}>{typeConfig.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs" style={{ color: '#DEDEE0', opacity: 0.7 }}>{report.description}</td>
                      <td className="px-6 py-4" style={{ color: '#DEDEE0', opacity: 0.8 }}>{getContador(report.type).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          <button onClick={() => handleDownload(report)} disabled={downloading === report.codigo}
                            className="p-2.5 transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50"
                            style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                            title="Descargar PDF">
                            {downloading === report.codigo ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid rgba(222, 222, 224, 0.1)' }}>
              <p style={{ color: '#DEDEE0', opacity: 0.6 }}>
                Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredReports.length)} de {filteredReports.length}
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
    </div>
  );
}