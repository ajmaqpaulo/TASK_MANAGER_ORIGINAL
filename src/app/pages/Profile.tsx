import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Loader2, Lock, LogOut, User, Mail, Building2, Shield } from 'lucide-react';
import { AuthService } from '../../services';
import type { UsuarioPerfil } from '../../services';
import logo from '@/assets/aae02afcf95717fd7154788982f1cae7f0997dcb.png';

export default function Profile() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  // Cambio de contraseña
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [contrasenaNueva, setContrasenaNueva] = useState('');
  const [contrasenaConfirmar, setContrasenaConfirmar] = useState('');

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const { data } = await AuthService.perfil();
        if (data.datos) setPerfil(data.datos);
      } catch (err) {
        console.error('Error cargando perfil:', err);
        navigate('/login');
      } finally { setLoading(false); }
    };
    cargarPerfil();
  }, [navigate]);

  const handleCambiarContrasena = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMensaje('');
    if (contrasenaNueva.length < 8) { setError('La nueva contraseña debe tener al menos 8 caracteres'); return; }
    if (contrasenaNueva !== contrasenaConfirmar) { setError('Las contraseñas no coinciden'); return; }
    setActionLoading(true);
    try {
      await AuthService.cambiarContrasena(contrasenaActual, contrasenaNueva);
      setMensaje('Contraseña actualizada correctamente');
      setContrasenaActual(''); setContrasenaNueva(''); setContrasenaConfirmar('');
      setShowPasswordForm(false);
    } catch (err: any) { setError(err.response?.data?.mensaje || 'Error al cambiar contraseña'); }
    finally { setActionLoading(false); }
  };

  const handleLogout = async () => {
    setActionLoading(true);
    try { await AuthService.logout(); } catch {}
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const inputStyle = {
    borderRadius: '14px', backgroundColor: 'rgba(42, 43, 49, 0.5)',
    borderColor: 'rgba(222, 222, 224, 0.1)', color: '#DEDEE0',
    borderWidth: '1px', borderStyle: 'solid' as const,
    boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)'
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#9D833E';
    e.target.style.boxShadow = '0 0 0 4px rgba(157, 131, 62, 0.1), inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(222, 222, 224, 0.1)';
    e.target.style.boxShadow = 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)';
  };

  if (loading || !perfil) {
    return (<div className="size-full flex items-center justify-center" style={{ backgroundColor: '#14151A' }}>
      <Loader2 className="animate-spin" size={40} style={{ color: '#9D833E' }} />
    </div>);
  }

  return (
    <div className="size-full overflow-auto p-6" style={{ backgroundColor: '#14151A' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Logo" className="w-20 h-20" />
          </div>
          <h2 style={{ color: '#DEDEE0' }}>Mi Perfil</h2>
          <p className="mt-1" style={{ color: '#DEDEE0', opacity: 0.6 }}>Información de tu cuenta</p>
        </div>

        {/* Mensajes */}
        {mensaje && (
          <div className="mb-4 px-4 py-3 text-sm text-center" style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '10px', color: '#6EE7B7'
          }}>{mensaje}</div>
        )}
        {error && (
          <div className="mb-4 px-4 py-3 text-sm text-center" style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px', color: '#FCA5A5'
          }}>{error}</div>
        )}

        {/* Datos del perfil (solo lectura) */}
        <div className="backdrop-blur-xl p-6 mb-6" style={{
          background: 'rgba(28, 29, 36, 0.7)', borderRadius: '24px',
          border: '1px solid rgba(222, 222, 224, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
        }}>
          <div className="space-y-5">
            {/* Nombre */}
            <div>
              <label className="flex items-center gap-2 mb-2" style={{ color: '#DEDEE0', opacity: 0.8 }}>
                <User size={16} /> Nombre completo
              </label>
              <div className="w-full px-4 py-4" style={{ ...inputStyle, backgroundColor: 'rgba(42, 43, 49, 0.3)', opacity: 0.9 }}>
                {perfil.nombre_completo}
              </div>
            </div>

            {/* Correo */}
            <div>
              <label className="flex items-center gap-2 mb-2" style={{ color: '#DEDEE0', opacity: 0.8 }}>
                <Mail size={16} /> Correo electrónico
              </label>
              <div className="w-full px-4 py-4" style={{ ...inputStyle, backgroundColor: 'rgba(42, 43, 49, 0.3)', opacity: 0.9 }}>
                {perfil.correo}
              </div>
            </div>

            {/* Unidad */}
            <div>
              <label className="flex items-center gap-2 mb-2" style={{ color: '#DEDEE0', opacity: 0.8 }}>
                <Building2 size={16} /> Unidad Organizacional
              </label>
              <div className="w-full px-4 py-4" style={{ ...inputStyle, backgroundColor: 'rgba(42, 43, 49, 0.3)', opacity: 0.9 }}>
                {perfil.unidad_nombre} ({perfil.unidad_codigo})
              </div>
            </div>

            {/* Rol */}
            <div>
              <label className="flex items-center gap-2 mb-2" style={{ color: '#DEDEE0', opacity: 0.8 }}>
                <Shield size={16} /> Rol
              </label>
              <div className="w-full px-4 py-4" style={{ ...inputStyle, backgroundColor: 'rgba(42, 43, 49, 0.3)', opacity: 0.9 }}>
                {perfil.rol_nombre}
              </div>
            </div>

            {/* Permisos */}
            <div>
              <label className="block mb-2" style={{ color: '#DEDEE0', opacity: 0.8 }}>Permisos asignados</label>
              <div className="flex flex-wrap gap-2">
                {perfil.permisos.map(p => (
                  <span key={p} className="px-3 py-1.5 text-xs font-medium" style={{
                    backgroundColor: 'rgba(157, 131, 62, 0.2)', color: '#9D833E',
                    borderRadius: '8px', border: '1px solid rgba(157, 131, 62, 0.3)'
                  }}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cambiar contraseña */}
        {!showPasswordForm ? (
          <button onClick={() => { setShowPasswordForm(true); setMensaje(''); setError(''); }}
            className="w-full py-4 mb-4 transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-2"
            style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', borderRadius: '14px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <Lock size={18} /> Cambiar Contraseña
          </button>
        ) : (
          <form onSubmit={handleCambiarContrasena} className="backdrop-blur-xl p-6 mb-4" style={{
            background: 'rgba(28, 29, 36, 0.7)', borderRadius: '24px',
            border: '1px solid rgba(222, 222, 224, 0.1)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
          }}>
            <h3 className="mb-4 flex items-center gap-2" style={{ color: '#DEDEE0' }}>
              <Lock size={18} /> Cambiar Contraseña
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2" style={{ color: '#DEDEE0', opacity: 0.8 }}>Contraseña actual</label>
                <input type="password" value={contrasenaActual} onChange={(e) => setContrasenaActual(e.target.value)}
                  placeholder="••••••••" className="w-full px-4 py-4 backdrop-blur-md border transition-all duration-300 focus:outline-none placeholder:text-gray-500"
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label className="block mb-2" style={{ color: '#DEDEE0', opacity: 0.8 }}>Nueva contraseña</label>
                <input type="password" value={contrasenaNueva} onChange={(e) => setContrasenaNueva(e.target.value)}
                  placeholder="Mínimo 8 caracteres" className="w-full px-4 py-4 backdrop-blur-md border transition-all duration-300 focus:outline-none placeholder:text-gray-500"
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label className="block mb-2" style={{ color: '#DEDEE0', opacity: 0.8 }}>Confirmar nueva contraseña</label>
                <input type="password" value={contrasenaConfirmar} onChange={(e) => setContrasenaConfirmar(e.target.value)}
                  placeholder="Repite la contraseña" className="w-full px-4 py-4 backdrop-blur-md border transition-all duration-300 focus:outline-none placeholder:text-gray-500"
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowPasswordForm(false); setError(''); }}
                  className="flex-1 py-3 transition-all duration-300 active:scale-[0.97]"
                  style={{ backgroundColor: 'rgba(42, 43, 49, 0.5)', color: '#DEDEE0', borderRadius: '14px', border: '1px solid rgba(222, 222, 224, 0.1)' }}>Cancelar</button>
                <button type="submit" disabled={actionLoading}
                  className="flex-1 py-3 transition-all duration-300 hover:shadow-xl active:scale-[0.97] disabled:opacity-50"
                  style={{ backgroundColor: '#9D833E', color: '#14151A', borderRadius: '14px', boxShadow: '0 4px 16px 0 rgba(157, 131, 62, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)' }}>
                  {actionLoading ? 'Guardando...' : 'Cambiar Contraseña'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Logout */}
        <button onClick={handleLogout} disabled={actionLoading}
          className="w-full py-4 transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', borderRadius: '14px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </div>
    </div>
  );
}