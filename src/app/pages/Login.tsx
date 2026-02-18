import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AuthService } from '../../services';
import logo from '@/assets/aae02afcf95717fd7154788982f1cae7f0997dcb.png';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'El correo electrónico es requerido';
    if (!emailRegex.test(email)) return 'Por favor ingresa un correo electrónico válido';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'La contraseña es requerida';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    return '';
  };

  const handleEmailBlur = () => setEmailError(validateEmail(email));
  const handlePasswordBlur = () => setPasswordError(validatePassword(password));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    setEmailError(emailValidation);
    setPasswordError(passwordValidation);
    setGeneralError('');

    if (emailValidation || passwordValidation) return;

    setLoading(true);
    try {
      const { data } = await AuthService.login({ correo: email, contrasena: password });
      if (data.exito && data.datos) {
        localStorage.setItem('access_token', data.datos.access_token);
        localStorage.setItem('refresh_token', data.datos.refresh_token);
        localStorage.setItem('usuario', JSON.stringify(data.datos.usuario));
        navigate('/dashboard');
      } else {
        setGeneralError(data.mensaje || 'Error al iniciar sesión');
      }
    } catch (err: any) {
      const mensaje = err.response?.data?.mensaje || 'Error de conexión con el servidor';
      setGeneralError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGeneralError('');
    setLoading(true);
    try {
      // TODO: Integrar Firebase Auth en el frontend para obtener el idToken
      // import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
      // const auth = getAuth();
      // const result = await signInWithPopup(auth, new GoogleAuthProvider());
      // const id_token = await result.user.getIdToken();
      // const { data } = await AuthService.loginGoogle({ id_token });

      setGeneralError('Login con Google aún no configurado en el frontend. Configura Firebase Auth.');
    } catch (err: any) {
      const mensaje = err.response?.data?.mensaje || 'Error al iniciar sesión con Google';
      setGeneralError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="size-full flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#14151A' }}>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl" 
        style={{ backgroundColor: '#9D833E' }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl" 
        style={{ backgroundColor: '#9D833E' }}></div>
      
      <div className="w-full max-w-md mx-4 relative">
        <div className="flex justify-center mb-[-50px] relative z-10">
          <img src={logo} alt="Logo" className="object-contain" style={{ width: '100px', height: '100px' }} />
        </div>

        <div className="px-8 pt-16 pb-10 backdrop-blur-xl" style={{
          background: 'rgba(28, 29, 36, 0.6)',
          borderRadius: '28px',
          border: '1px solid rgba(222, 222, 224, 0.08)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.03)'
        }}>
          <div className="text-center mb-8">
            <h1 className="text-2xl tracking-wider uppercase" style={{ color: '#DEDEE0', fontWeight: '300', letterSpacing: '4px' }}>
              INICIO
            </h1>
          </div>

          {/* Error general */}
          {generalError && (
            <div className="mb-4 px-4 py-3 text-sm text-center" style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              color: '#FCA5A5'
            }}>
              {generalError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Campo de Email */}
            <div>
              <label className="block text-xs mb-2 uppercase tracking-wider" style={{ color: '#9D833E', opacity: 0.8 }}>
                Correo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                disabled={loading}
                className="w-full px-0 py-2 transition-all duration-300 focus:outline-none placeholder:text-gray-600 disabled:opacity-50"
                style={{
                  backgroundColor: 'transparent',
                  borderWidth: '0 0 1px 0',
                  borderStyle: 'solid',
                  borderColor: '#9D833E',
                  color: '#DEDEE0',
                  fontSize: '15px',
                  borderRadius: '0'
                }}
                onFocus={(e) => { e.target.style.borderBottomWidth = '2px'; e.target.style.borderBottomColor = '#9D833E'; }}
                onBlur={(e) => { e.target.style.borderBottomWidth = '1px'; e.target.style.borderBottomColor = '#9D833E'; handleEmailBlur(); }}
              />
              {emailError && <p className="text-red-500 text-xs mt-1.5">{emailError}</p>}
            </div>

            {/* Campo de Contraseña */}
            <div>
              <label className="block text-xs mb-2 uppercase tracking-wider" style={{ color: '#9D833E', opacity: 0.8 }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full px-0 py-2 transition-all duration-300 focus:outline-none placeholder:text-gray-600 disabled:opacity-50"
                style={{
                  backgroundColor: 'transparent',
                  borderWidth: '0 0 1px 0',
                  borderStyle: 'solid',
                  borderColor: '#9D833E',
                  color: '#DEDEE0',
                  fontSize: '15px',
                  borderRadius: '0'
                }}
                onFocus={(e) => { e.target.style.borderBottomWidth = '2px'; e.target.style.borderBottomColor = '#9D833E'; }}
                onBlur={(e) => { e.target.style.borderBottomWidth = '1px'; e.target.style.borderBottomColor = '#9D833E'; handlePasswordBlur(); }}
              />
              {passwordError && <p className="text-red-500 text-xs mt-1.5">{passwordError}</p>}
            </div>

            {/* Botón de Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-8 transition-all duration-300 hover:shadow-xl active:scale-[0.98] uppercase tracking-widest text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#9D833E',
                color: '#14151A',
                borderRadius: '12px',
                boxShadow: '0 4px 16px 0 rgba(157, 131, 62, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',
                letterSpacing: '2px'
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.boxShadow = '0 6px 24px 0 rgba(157, 131, 62, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px 0 rgba(157, 131, 62, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)'; }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          {/* Opción de Google Login */}
          <div className="mt-6">
            <div className="relative flex items-center justify-center mb-5">
              <div className="border-t w-full" style={{ borderColor: 'rgba(222, 222, 224, 0.06)' }}></div>
              <span className="absolute px-4 text-xs backdrop-blur-md" style={{ background: 'rgba(28, 29, 36, 0.6)', color: '#DEDEE0', opacity: 0.5 }}>
                o continúa con
              </span>
            </div>
            
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3.5 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 backdrop-blur-md group disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'rgba(42, 43, 49, 0.4)',
                color: '#DEDEE0',
                borderRadius: '12px',
                border: '1px solid rgba(222, 222, 224, 0.08)',
                boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.backgroundColor = 'rgba(42, 43, 49, 0.6)'; e.currentTarget.style.borderColor = 'rgba(222, 222, 224, 0.15)'; }}}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(42, 43, 49, 0.4)'; e.currentTarget.style.borderColor = 'rgba(222, 222, 224, 0.08)'; }}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
                <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
                <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49L4.405 11.9z" fill="#FBBC05"/>
                <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.737 7.396 3.977 10 3.977z" fill="#EA4335"/>
              </svg>
              Iniciar sesión con Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}